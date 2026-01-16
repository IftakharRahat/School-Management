'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Get first branch ID (fallback when no session)
export async function getFirstBranch(): Promise<string | null> {
    const branch = await prisma.branch.findFirst({
        orderBy: { createdAt: 'asc' },
    });
    return branch?.id || null;
}

// Validation schemas
const homeworkSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    classId: z.string().min(1, 'Class is required'),
    sectionId: z.string().optional().nullable(),
    subjectId: z.string().min(1, 'Subject is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    maxPoints: z.number().min(1).max(1000).default(100),
    attachmentUrl: z.string().optional().nullable(),
});

export type HomeworkFormData = z.infer<typeof homeworkSchema>;

// Get homeworks with pagination and filters
export async function getHomeworks({
    branchId,
    classId,
    subjectId,
    teacherId,
    status,
    page = 1,
    limit = 10,
}: {
    branchId: string;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
    page?: number;
    limit?: number;
}) {
    const skip = (page - 1) * limit;

    const where: any = {
        class: { branchId },
    };

    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const [homeworks, total] = await Promise.all([
        prisma.homework.findMany({
            where,
            include: {
                class: true,
                section: true,
                subject: true,
                teacher: { include: { user: true } },
                _count: { select: { submissions: true } },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.homework.count({ where }),
    ]);

    return {
        homeworks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Get single homework with submissions
export async function getHomework(id: string) {
    return prisma.homework.findUnique({
        where: { id },
        include: {
            class: true,
            section: true,
            subject: true,
            teacher: { include: { user: true } },
            submissions: {
                include: {
                    student: { include: { user: true } },
                },
                orderBy: { submittedAt: 'desc' },
            },
        },
    });
}

// Create homework
export async function createHomework(data: HomeworkFormData, teacherId: string) {
    const validated = homeworkSchema.parse(data);

    const homework = await prisma.homework.create({
        data: {
            classId: validated.classId,
            sectionId: validated.sectionId || null,
            subjectId: validated.subjectId,
            teacherId,
            title: validated.title,
            description: validated.description,
            attachmentUrl: validated.attachmentUrl || null,
            dueDate: new Date(validated.dueDate),
            maxPoints: validated.maxPoints,
            status: 'ACTIVE',
        },
    });

    revalidatePath('/admin/homework');
    revalidatePath('/teacher/homework');
    return homework;
}

// Update homework
export async function updateHomework(id: string, data: Partial<HomeworkFormData>) {
    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.classId) updateData.classId = data.classId;
    if (data.sectionId !== undefined) updateData.sectionId = data.sectionId || null;
    if (data.subjectId) updateData.subjectId = data.subjectId;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.maxPoints) updateData.maxPoints = data.maxPoints;
    if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl || null;

    const updated = await prisma.homework.update({
        where: { id },
        data: updateData,
    });

    revalidatePath('/admin/homework');
    revalidatePath(`/admin/homework/${id}`);
    return updated;
}

// Update homework status
export async function updateHomeworkStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED') {
    const updated = await prisma.homework.update({
        where: { id },
        data: { status },
    });

    revalidatePath('/admin/homework');
    return updated;
}

// Delete homework
export async function deleteHomework(id: string) {
    await prisma.homework.delete({ where: { id } });
    revalidatePath('/admin/homework');
}

// ============================================
// SUBMISSION FUNCTIONS
// ============================================

// Submit homework (student)
export async function submitHomework(homeworkId: string, studentId: string, content: string, attachmentUrl?: string) {
    const homework = await prisma.homework.findUnique({ where: { id: homeworkId } });
    if (!homework) throw new Error('Homework not found');

    const isLate = new Date() > homework.dueDate;

    const submission = await prisma.homeworkSubmission.upsert({
        where: {
            homeworkId_studentId: { homeworkId, studentId },
        },
        create: {
            homeworkId,
            studentId,
            content,
            attachmentUrl,
            status: isLate ? 'LATE' : 'SUBMITTED',
        },
        update: {
            content,
            attachmentUrl,
            submittedAt: new Date(),
            status: isLate ? 'LATE' : 'SUBMITTED',
        },
    });

    revalidatePath(`/student/homework/${homeworkId}`);
    revalidatePath(`/admin/homework/${homeworkId}`);
    return submission;
}

// Grade submission (teacher)
export async function gradeSubmission(submissionId: string, points: number, feedback: string, gradedById: string) {
    const updated = await prisma.homeworkSubmission.update({
        where: { id: submissionId },
        data: {
            points,
            feedback,
            gradedAt: new Date(),
            gradedById,
            status: 'GRADED',
        },
    });

    revalidatePath('/admin/homework');
    return updated;
}

// Get student's submissions
export async function getStudentSubmissions(studentId: string) {
    return prisma.homeworkSubmission.findMany({
        where: { studentId },
        include: {
            homework: {
                include: {
                    class: true,
                    subject: true,
                },
            },
        },
        orderBy: { submittedAt: 'desc' },
    });
}

// Get classes for dropdown
export async function getClassesForHomework(branchId: string) {
    console.log('getClassesForHomework called with branchId:', branchId, typeof branchId);
    if (!prisma) {
        console.error('Prisma instance is undefined');
        throw new Error('Database connection failed');
    }
    return prisma.class.findMany({
        where: { branchId },
        include: {
            sections: { orderBy: { name: 'asc' } },
            subjects: { orderBy: { name: 'asc' } },
        },
        orderBy: { grade: 'asc' },
    });
}

// Get assignments for a student (active homeworks for their class/section)
export async function getStudentAssignments(studentId: string) {
    // Get active enrollment to find class/section
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            status: 'ACTIVE'
        },
        include: {
            section: true // to get classId
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!enrollment) return [];

    const classId = enrollment.section.classId;
    const sectionId = enrollment.sectionId;

    // Fetch homeworks for student's class (and specific section if set, or no section)
    const homeworks = await prisma.homework.findMany({
        where: {
            classId: classId,
            OR: [
                { sectionId: null },
                { sectionId: sectionId },
            ],
            status: { not: 'DRAFT' }, // Show Active, Closed, Cancelled
        },
        include: {
            subject: true,
            teacher: { include: { user: true } },
            submissions: {
                where: { studentId },
                take: 1,
            },
        },
        orderBy: { dueDate: 'asc' },
    });

    return homeworks.map(hw => ({
        ...hw,
        submission: hw.submissions[0] || null, // Attach their specific submission
    }));
}

// Get teachers for assignment dropdown
export async function getTeachersForAssignment(branchId: string) {
    return prisma.teacher.findMany({
        where: { branchId },
        include: { user: { select: { name: true } } },
        orderBy: { user: { name: 'asc' } },
    });
}
