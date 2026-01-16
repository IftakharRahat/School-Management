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

// Validation schemas
const guardianSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone is required'),
    occupation: z.string().optional().nullable(),
    workplace: z.string().optional().nullable(),
});

export type GuardianFormData = z.infer<typeof guardianSchema>;

// Get guardians with pagination
export async function getGuardians({
    page = 1,
    limit = 10,
    search = '',
    branchId,
}: {
    page?: number;
    limit?: number;
    search?: string;
    branchId: string;
}) {
    const skip = (page - 1) * limit;

    const where: any = {
        user: { branchId },
    };

    if (search) {
        where.OR = [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { phone: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
    }

    const [guardians, total] = await Promise.all([
        prisma.guardian.findMany({
            where,
            include: {
                user: true,
                students: {
                    include: {
                        student: {
                            include: { user: true },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.guardian.count({ where }),
    ]);

    return {
        guardians,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Get single guardian
export async function getGuardian(id: string) {
    return prisma.guardian.findUnique({
        where: { id },
        include: {
            user: true,
            students: {
                include: {
                    student: {
                        include: { user: true },
                    },
                },
            },
        },
    });
}

// Create guardian
export async function createGuardian(data: GuardianFormData, branchId: string, tenantId: string) {
    const validated = guardianSchema.parse(data);

    const hashedPassword = await hash('Guardian@123', 12);

    try {
        const user = await prisma.user.create({
            data: {
                tenantId,
                branchId,
                email: validated.email,
                password: hashedPassword,
                name: `${validated.firstName} ${validated.lastName}`,
                phone: validated.phone,
                role: 'PARENT',
                type: 'GUARDIAN',
                isActive: true,
            },
        });

        const guardian = await prisma.guardian.create({
            data: {
                userId: user.id,
                occupation: validated.occupation,
                workplace: validated.workplace,
            },
        });

        revalidatePath('/admin/guardians');
        revalidatePath('/admin/students/new');
        revalidatePath('/admin/students');
        return guardian;
    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            throw new Error('A user with this email address already exists.');
        }
        console.error('Error creating guardian:', error);
        throw new Error('Failed to create guardian. Please try again.');
    }
}

// Update guardian
export async function updateGuardian(id: string, data: Partial<GuardianFormData>) {
    const guardian = await prisma.guardian.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!guardian) throw new Error('Guardian not found');

    // Update user info
    if (data.firstName || data.lastName || data.email || data.phone) {
        await prisma.user.update({
            where: { id: guardian.userId },
            data: {
                name: data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : undefined,
                email: data.email || undefined,
                phone: data.phone || undefined,
            },
        });
    }

    // Update guardian info
    const updated = await prisma.guardian.update({
        where: { id },
        data: {
            occupation: data.occupation,
            workplace: data.workplace,
        },
    });

    revalidatePath('/admin/guardians');
    revalidatePath(`/admin/guardians/${id}`);
    return updated;
}

// Delete guardian
export async function deleteGuardian(id: string) {
    const guardian = await prisma.guardian.findUnique({ where: { id } });
    if (!guardian) throw new Error('Guardian not found');

    await prisma.guardian.delete({ where: { id } });
    await prisma.user.update({
        where: { id: guardian.userId },
        data: { isActive: false },
    });

    revalidatePath('/admin/guardians');
}

// Get all guardians for dropdown (simpler query)
export async function getGuardiansForDropdown(branchId: string) {
    return prisma.guardian.findMany({
        where: {
            user: { branchId },
        },
        include: {
            user: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

// ============================================
// GUARDIAN-STUDENT LINKING FUNCTIONS
// ============================================

// Get students linked to a guardian
export async function getGuardianStudents(guardianId: string) {
    return prisma.studentGuardian.findMany({
        where: { guardianId },
        include: {
            student: {
                include: {
                    user: true,
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        include: {
                            section: {
                                include: { class: true },
                            },
                        },
                        take: 1,
                    },
                },
            },
        },
    });
}

// Get available students for linking (students in the same branch)
export async function getAvailableStudents(branchId: string, guardianId: string) {
    // Get already linked student IDs
    const linkedStudents = await prisma.studentGuardian.findMany({
        where: { guardianId },
        select: { studentId: true },
    });
    const linkedIds = linkedStudents.map(ls => ls.studentId);

    return prisma.student.findMany({
        where: {
            branchId,
            id: { notIn: linkedIds },
        },
        include: {
            user: true,
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: { class: true },
                    },
                },
                take: 1,
            },
        },
        orderBy: { user: { name: 'asc' } },
    });
}

// Link a student to a guardian
export async function linkStudentToGuardian(
    guardianId: string,
    studentId: string,
    relation: 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'UNCLE' | 'AUNT' | 'GRANDFATHER' | 'GRANDMOTHER' | 'OTHER',
    isPrimary: boolean = false
) {
    // Check if already linked
    const existing = await prisma.studentGuardian.findUnique({
        where: {
            studentId_guardianId: { studentId, guardianId },
        },
    });

    if (existing) {
        throw new Error('Student is already linked to this guardian');
    }

    // If setting as primary, unset other primary guardians for this student
    if (isPrimary) {
        await prisma.studentGuardian.updateMany({
            where: { studentId, isPrimary: true },
            data: { isPrimary: false },
        });
    }

    const link = await prisma.studentGuardian.create({
        data: {
            guardianId,
            studentId,
            relation,
            isPrimary,
        },
    });

    revalidatePath(`/admin/guardians/${guardianId}`);
    revalidatePath(`/admin/guardians/${guardianId}/students`);
    revalidatePath(`/admin/students/${studentId}`);
    return link;
}

// Unlink a student from a guardian
export async function unlinkStudentFromGuardian(guardianId: string, studentId: string) {
    await prisma.studentGuardian.delete({
        where: {
            studentId_guardianId: { studentId, guardianId },
        },
    });

    revalidatePath(`/admin/guardians/${guardianId}`);
    revalidatePath(`/admin/guardians/${guardianId}/students`);
    revalidatePath(`/admin/students/${studentId}`);
}

// Update student-guardian relationship
export async function updateStudentGuardianLink(
    guardianId: string,
    studentId: string,
    data: { relation?: string; isPrimary?: boolean }
) {
    // If setting as primary, unset other primary guardians for this student
    if (data.isPrimary) {
        await prisma.studentGuardian.updateMany({
            where: { studentId, isPrimary: true },
            data: { isPrimary: false },
        });
    }

    const updated = await prisma.studentGuardian.update({
        where: {
            studentId_guardianId: { studentId, guardianId },
        },
        data: {
            relation: data.relation as any,
            isPrimary: data.isPrimary,
        },
    });

    revalidatePath(`/admin/guardians/${guardianId}`);
    revalidatePath(`/admin/students/${studentId}`);
    return updated;
}
