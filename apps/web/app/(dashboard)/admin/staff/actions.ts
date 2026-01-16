'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Get first branch ID (fallback)
export async function getFirstBranch(): Promise<string | null> {
    const branch = await prisma.branch.findFirst({
        orderBy: { createdAt: 'asc' },
    });
    return branch?.id || null;
}

// Validation schemas
const staffSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().nullable(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),

    employeeId: z.string().min(1, 'Employee ID is required'),
    designation: z.string().min(1, 'Designation is required'),
    department: z.string().optional().nullable(),
    joiningDate: z.string(),
    salary: z.preprocess((val) => Number(val), z.number().min(0).optional().nullable()),
});

export type StaffFormData = z.infer<typeof staffSchema>;

// Get staff list
export async function getStaffs({
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
        branchId,
    };

    if (search) {
        where.OR = [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { employeeId: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [staffs, total] = await prisma.$transaction([
        prisma.staff.findMany({
            where,
            include: {
                user: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.staff.count({ where }),
    ]);

    return {
        staffs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Create Staff
export async function createStaff(data: StaffFormData, branchId: string, tenantId: string) {
    const validated = staffSchema.parse(data);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            tenantId_email: {
                tenantId,
                email: validated.email,
            },
        },
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    // Check if employeeId exists in branch
    const existingStaff = await prisma.staff.findUnique({
        where: {
            branchId_employeeId: {
                branchId,
                employeeId: validated.employeeId,
            },
        },
    });

    if (existingStaff) {
        throw new Error('Employee ID already exists in this branch');
    }

    const hashedPassword = await hash(validated.password || '123456', 10);

    // Create user and staff in transaction
    const staff = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: `${validated.firstName} ${validated.lastName}`,
                email: validated.email,
                phone: validated.phone,
                password: hashedPassword,
                role: 'STAFF',
                type: 'STAFF',
                tenantId,
            },
        });

        return tx.staff.create({
            data: {
                userId: user.id,
                branchId,
                employeeId: validated.employeeId,
                designation: validated.designation,
                department: validated.department,
                joiningDate: new Date(validated.joiningDate),
                salary: validated.salary,
            },
        });
    });

    revalidatePath('/admin/staff');
    return staff;
}

// Update Staff
export async function updateStaff(id: string, data: Partial<StaffFormData>) {
    const staff = await prisma.staff.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!staff) throw new Error('Staff not found');

    // Update user info
    if (data.firstName || data.lastName || data.email || data.phone) {
        await prisma.user.update({
            where: { id: staff.userId },
            data: {
                name: data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : undefined,
                email: data.email || undefined,
                phone: data.phone || undefined,
            },
        });
    }

    // Update staff info
    const updated = await prisma.staff.update({
        where: { id },
        data: {
            employeeId: data.employeeId,
            designation: data.designation,
            department: data.department,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
            salary: data.salary,
        },
    });

    revalidatePath('/admin/staff');
    return updated;
}

// Delete Staff
export async function deleteStaff(id: string) {
    const staff = await prisma.staff.findUnique({
        where: { id },
    });

    if (!staff) throw new Error('Staff not found');

    // Delete user (cascade will handle staff)
    await prisma.user.delete({
        where: { id: staff.userId },
    });

    revalidatePath('/admin/staff');
    return { success: true };
}
