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
const classSchema = z.object({
    name: z.string().min(1, 'Class name is required'),
    grade: z.number().min(1).max(12),
});

const sectionSchema = z.object({
    name: z.string().min(1, 'Section name is required'),
    capacity: z.number().optional().nullable(),
});

export type ClassFormData = z.infer<typeof classSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;

// Get all classes with sections
export async function getClasses(branchId: string) {
    return prisma.class.findMany({
        where: { branchId },
        include: {
            sections: {
                orderBy: { name: 'asc' },
            },
            _count: {
                select: { sections: true },
            },
        },
        orderBy: { grade: 'asc' },
    });
}

// Get single class
export async function getClass(id: string) {
    return prisma.class.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: { name: 'asc' },
            },
        },
    });
}

// Create class
export async function createClass(data: ClassFormData, branchId: string) {
    const validated = classSchema.parse(data);

    const classItem = await prisma.class.create({
        data: {
            branchId,
            name: validated.name,
            grade: validated.grade,
        },
    });

    revalidatePath('/admin/classes');
    return classItem;
}

// Update class
export async function updateClass(id: string, data: Partial<ClassFormData>) {
    const updated = await prisma.class.update({
        where: { id },
        data: {
            name: data.name,
            grade: data.grade,
        },
    });

    revalidatePath('/admin/classes');
    revalidatePath(`/admin/classes/${id}`);
    return updated;
}

// Delete class
export async function deleteClass(id: string) {
    await prisma.class.delete({ where: { id } });
    revalidatePath('/admin/classes');
}

// Create section
export async function createSection(classId: string, data: SectionFormData) {
    const validated = sectionSchema.parse(data);

    const section = await prisma.section.create({
        data: {
            classId,
            name: validated.name,
            capacity: validated.capacity,
        },
    });

    revalidatePath('/admin/classes');
    return section;
}

// Update section
export async function updateSection(id: string, data: Partial<SectionFormData>) {
    const updated = await prisma.section.update({
        where: { id },
        data: {
            name: data.name,
            capacity: data.capacity,
        },
    });

    revalidatePath('/admin/classes');
    return updated;
}

// Delete section
export async function deleteSection(id: string) {
    await prisma.section.delete({ where: { id } });
    revalidatePath('/admin/classes');
}

// ============================================
// CLASS TEACHER ASSIGNMENT FUNCTIONS
// ============================================

// Get teachers for dropdown
export async function getTeachersForDropdown(branchId: string) {
    return prisma.teacher.findMany({
        where: { branchId },
        include: {
            user: { select: { name: true, email: true } },
        },
        orderBy: { user: { name: 'asc' } },
    });
}

// Assign class teacher to section
export async function assignClassTeacher(sectionId: string, teacherId: string | null) {
    const updated = await prisma.section.update({
        where: { id: sectionId },
        data: { classTeacherId: teacherId },
    });

    revalidatePath('/admin/classes');
    return updated;
}

// Get section with class teacher info
export async function getSectionWithTeacher(sectionId: string) {
    return prisma.section.findUnique({
        where: { id: sectionId },
        include: {
            class: true,
            classTeacher: {
                include: { user: true },
            },
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    student: {
                        include: { user: true },
                    },
                },
            },
        },
    });
}

// ============================================
// STUDENT ENROLLMENT FUNCTIONS
// ============================================

// Get students available for enrollment (not enrolled in any class)
export async function getAvailableStudentsForEnrollment(branchId: string) {
    // Get students who don't have an active enrollment
    const studentsWithActiveEnrollment = await prisma.enrollment.findMany({
        where: { status: 'ACTIVE' },
        select: { studentId: true },
    });
    const enrolledIds = studentsWithActiveEnrollment.map(e => e.studentId);

    return prisma.student.findMany({
        where: {
            branchId,
            id: { notIn: enrolledIds },
        },
        include: { user: true },
        orderBy: { user: { name: 'asc' } },
    });
}

// Enroll student in section
export async function enrollStudent(studentId: string, sectionId: string, academicYearId: string, rollNumber?: string) {
    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
        where: {
            studentId,
            academicYearId,
            status: 'ACTIVE',
        },
    });

    if (existing) {
        throw new Error('Student is already enrolled in a class');
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            studentId,
            sectionId,
            academicYearId,
            rollNumber,
            status: 'ACTIVE',
        },
    });

    revalidatePath('/admin/classes');
    revalidatePath(`/admin/students/${studentId}`);
    return enrollment;
}

// Remove student from section
export async function unenrollStudent(enrollmentId: string) {
    await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'INACTIVE' },
    });

    revalidatePath('/admin/classes');
}

// Get current academic year
export async function getCurrentAcademicYear(branchId: string) {
    return prisma.academicYear.findFirst({
        where: { branchId, isCurrent: true },
    });
}
