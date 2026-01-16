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
const studentSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.string().optional().nullable(),
    address: z.string().min(1, 'Address is required'),
    admissionNo: z.string().min(1, 'Admission number is required'),
    admissionDate: z.string(),
    classId: z.string().min(1, 'Class is required'),
    sectionId: z.string().min(1, 'Section is required'),
    guardianId: z.string().optional(),
    relation: z.enum(['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER']).optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Get students with pagination and filters
export async function getStudents({
    page = 1,
    limit = 10,
    search = '',
    classId = '',
    branchId,
}: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    sectionId?: string;
    branchId: string;
}) {
    const skip = (page - 1) * limit;

    const where: any = {
        branchId,
    };

    if (search) {
        where.OR = [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { admissionNo: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (classId) {
        where.enrollments = {
            some: {
                section: { classId },
                status: 'ACTIVE',
            },
        };
    }

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            include: {
                user: true,
                guardians: {
                    include: {
                        guardian: {
                            include: { user: true },
                        },
                    },
                    where: { isPrimary: true },
                    take: 1,
                },
                enrollments: {
                    where: { status: 'ACTIVE' },
                    include: {
                        section: {
                            include: { class: true },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.student.count({ where }),
    ]);

    return {
        students,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Get single student
export async function getStudent(id: string) {
    return prisma.student.findUnique({
        where: { id },
        include: {
            user: true,
            guardians: {
                include: {
                    guardian: {
                        include: { user: true },
                    },
                },
            },
            enrollments: {
                include: {
                    section: {
                        include: { class: true },
                    },
                    academicYear: true,
                },
            },
        },
    });
}

// Create student
export async function createStudent(data: StudentFormData, branchId: string, tenantId: string) {
    const validated = studentSchema.parse(data);

    // Create user account for student
    const hashedPassword = await hash('Student@123', 12);

    const user = await prisma.user.create({
        data: {
            tenantId,
            branchId,
            email: validated.email || `${validated.admissionNo}@student.schoolama.com`,
            password: hashedPassword,
            name: `${validated.firstName} ${validated.lastName}`,
            phone: validated.phone,
            role: 'STUDENT',
            type: 'STUDENT',
            isActive: true,
        },
    });

    // Get current academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { branchId, isCurrent: true },
    });

    // Create student record
    const student = await prisma.student.create({
        data: {
            userId: user.id,
            branchId,
            admissionNo: validated.admissionNo,
            admissionDate: new Date(validated.admissionDate),
            dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
            gender: validated.gender,
            bloodGroup: validated.bloodGroup,
            address: validated.address,
            enrollments: academicYear ? {
                create: {
                    sectionId: validated.sectionId,
                    academicYearId: academicYear.id,
                    rollNumber: null,
                    status: 'ACTIVE',
                },
            } : undefined,
        },
    });

    // Link guardian if provided
    if (validated.guardianId) {
        await prisma.studentGuardian.create({
            data: {
                studentId: student.id,
                guardianId: validated.guardianId,
                relation: validated.relation || 'FATHER', // Default relation, can be made configurable
                isPrimary: true,
            },
        });
    }

    revalidatePath('/admin/students');
    return student;
}

// Update student
export async function updateStudent(id: string, data: Partial<StudentFormData>) {
    const student = await prisma.student.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!student) throw new Error('Student not found');

    // Update user info
    if (data.firstName || data.lastName || data.email || data.phone) {
        await prisma.user.update({
            where: { id: student.userId },
            data: {
                name: data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : undefined,
                email: data.email || undefined,
                phone: data.phone || undefined,
            },
        });
    }

    // Update student info
    const updated = await prisma.student.update({
        where: { id },
        data: {
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            address: data.address,
        },
    });

    // Update guardian link if provided
    if (data.guardianId) {
        // Check if this guardian is already linked
        const existingLink = await prisma.studentGuardian.findUnique({
            where: {
                studentId_guardianId: {
                    studentId: id,
                    guardianId: data.guardianId,
                },
            },
        });

        if (existingLink) {
            // Update existing link
            await prisma.studentGuardian.update({
                where: { id: existingLink.id },
                data: {
                    relation: data.relation || existingLink.relation,
                    isPrimary: true,
                },
            });
        } else {
            // Remove old primary link if we are setting a new primary
            // (Optional: depending on business logic, for now let's just add the new one as primary)
            // Ideally we might want to unset other primaries or just add this one.
            // Simplified: Upsert logic implies we might have changed the guardian entirely.

            // If we are changing the guardian (different ID), we probably want to update the relation to point to the NEW guardian.
            // But specific requirement is just to make it save.

            // Delete old primary link for this student
            await prisma.studentGuardian.deleteMany({
                where: { studentId: id, isPrimary: true }
            });

            // Create new link
            await prisma.studentGuardian.create({
                data: {
                    studentId: id,
                    guardianId: data.guardianId,
                    relation: data.relation || 'FATHER',
                    isPrimary: true,
                },
            });
        }
    }

    revalidatePath('/admin/students');
    revalidatePath(`/admin/students/${id}`);
    return updated;
}

// Delete student
export async function deleteStudent(id: string) {
    const student = await prisma.student.findUnique({
        where: { id },
    });

    if (!student) throw new Error('Student not found');

    // Delete enrollments first
    await prisma.enrollment.deleteMany({
        where: { studentId: id },
    });

    // Delete guardian relations
    await prisma.studentGuardian.deleteMany({
        where: { studentId: id },
    });

    // Delete student
    await prisma.student.delete({
        where: { id },
    });

    // Deactivate user account
    await prisma.user.update({
        where: { id: student.userId },
        data: { isActive: false },
    });

    revalidatePath('/admin/students');
}

// Get classes for dropdown
export async function getClasses(branchId: string) {
    return prisma.class.findMany({
        where: { branchId },
        include: {
            sections: true,
        },
        orderBy: { grade: 'asc' },
    });
}

// Get guardians for dropdown
export async function getGuardians(branchId: string) {
    return prisma.guardian.findMany({
        where: {
            user: {
                branchId,
            },
        },
        include: {
            user: true,
        },
    });
}

