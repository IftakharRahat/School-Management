'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Get first branch ID (fallback when no session)
export async function getFirstBranch(): Promise<string | null> {
    const branch = await prisma.branch.findFirst({
        orderBy: { createdAt: 'asc' },
    });
    return branch?.id || null;
}

const teacherSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    address: z.string().optional().nullable(),
    employeeId: z.string().min(1, 'Employee ID is required'),
    designation: z.string().min(1, 'Designation is required'),
    department: z.string().optional().nullable(),
    qualification: z.string().optional().nullable(),
    specialization: z.string().optional().nullable(),
    joiningDate: z.string(),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;

// Get teachers with pagination
export async function getTeachers({
    page = 1,
    limit = 10,
    search = '',
    department = '',
    branchId,
}: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    branchId: string;
}) {
    const skip = (page - 1) * limit;

    const where: any = {
        branchId,
    };

    if (search) {
        where.OR = [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { employeeId: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
    }

    if (department) {
        where.department = department;
    }

    const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
            where,
            include: {
                user: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.teacher.count({ where }),
    ]);

    return {
        teachers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Get single teacher by ID
export async function getTeacher(id: string) {
    const teacher = await prisma.teacher.findUnique({
        where: { id },
        include: {
            user: true,
        },
    });
    return teacher;
}

// Create teacher
export async function createTeacher(data: TeacherFormData, branchId: string, tenantId: string) {
    const validated = teacherSchema.parse(data);

    const hashedPassword = await hash('Teacher@123', 12);

    try {
        const user = await prisma.user.create({
            data: {
                tenantId,
                branchId,
                email: validated.email,
                password: hashedPassword,
                name: `${validated.firstName} ${validated.lastName}`,
                phone: validated.phone,
                role: 'TEACHER',
                type: 'TEACHER',
                isActive: true,
            },
        });

        const teacher = await prisma.teacher.create({
            data: {
                userId: user.id,
                branchId,
                employeeId: validated.employeeId,
                designation: validated.designation,
                department: validated.department,
                qualification: validated.qualification,
                specialization: validated.specialization,
                joiningDate: new Date(validated.joiningDate),
                dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
                gender: validated.gender,
                address: validated.address,
            },
        });

        revalidatePath('/admin/teachers');
        return teacher;
    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            throw new Error('A user with this email address already exists.');
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('employeeId')) {
            throw new Error('A teacher with this Employee ID already exists.');
        }
        console.error('Error creating teacher:', error);
        throw new Error('Failed to create teacher. Please try again.');
    }


}

// Update teacher
export async function updateTeacher(id: string, data: Partial<TeacherFormData>) {
    const teacher = await prisma.teacher.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!teacher) throw new Error('Teacher not found');

    // Update user info
    if (data.firstName || data.lastName || data.email || data.phone) {
        await prisma.user.update({
            where: { id: teacher.userId },
            data: {
                name: data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : undefined,
                email: data.email || undefined,
                phone: data.phone || undefined,
            },
        });
    }

    // Update teacher info
    console.log('Updating teacher with data:', JSON.stringify(data, null, 2));

    const updated = await prisma.teacher.update({
        where: { id },
        data: {
            employeeId: data.employeeId,
            designation: data.designation,
            department: data.department,
            qualification: data.qualification,
            specialization: data.specialization,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            gender: data.gender,
            address: data.address,
        },
    });

    console.log('Teacher updated successfully');
    revalidatePath('/admin/teachers');
    revalidatePath(`/admin/teachers/${id}`);
    revalidatePath(`/admin/teachers/${id}/edit`);
    return updated;
}

// Delete teacher
export async function deleteTeacher(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    await prisma.teacher.delete({ where: { id } });
    await prisma.user.update({
        where: { id: teacher.userId },
        data: { isActive: false },
    });

    revalidatePath('/admin/teachers');
}

// Get departments for dropdown
export async function getDepartments() {
    return ['Science', 'Arts', 'Commerce', 'Computer', 'Languages', 'Physical Education', 'Administration'];
}

// ============================================
// SUBJECT ASSIGNMENT FUNCTIONS
// ============================================

// Get subjects assigned to a teacher
export async function getTeacherSubjects(teacherId: string) {
    return prisma.subjectAssignment.findMany({
        where: { teacherId },
        include: {
            subject: {
                include: {
                    class: true,
                },
            },
        },
        orderBy: {
            subject: { class: { grade: 'asc' } },
        },
    });
}

// Get available subjects for assignment (all subjects in branch)
export async function getAvailableSubjects(branchId: string) {
    return prisma.subject.findMany({
        where: {
            class: { branchId },
        },
        include: {
            class: true,
        },
        orderBy: [
            { class: { grade: 'asc' } },
            { name: 'asc' },
        ],
    });
}

// Assign subject to teacher
export async function assignSubjectToTeacher(teacherId: string, subjectId: string) {
    // Check if already assigned
    const existing = await prisma.subjectAssignment.findUnique({
        where: {
            teacherId_subjectId: { teacherId, subjectId },
        },
    });

    if (existing) {
        throw new Error('Subject already assigned to this teacher');
    }

    const assignment = await prisma.subjectAssignment.create({
        data: {
            teacherId,
            subjectId,
        },
    });

    revalidatePath(`/admin/teachers/${teacherId}`);
    revalidatePath(`/admin/teachers/${teacherId}/subjects`);
    return assignment;
}

// Remove subject assignment
export async function removeSubjectFromTeacher(teacherId: string, subjectId: string) {
    await prisma.subjectAssignment.delete({
        where: {
            teacherId_subjectId: { teacherId, subjectId },
        },
    });

    revalidatePath(`/admin/teachers/${teacherId}`);
    revalidatePath(`/admin/teachers/${teacherId}/subjects`);
}
