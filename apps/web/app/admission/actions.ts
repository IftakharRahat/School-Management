'use server';

import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const admissionSchema = z.object({
    branchId: z.string().min(1, 'Branch is required'),
    studentName: z.string().min(1, 'Student name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.string().optional(),
    religion: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    guardianName: z.string().min(1, 'Guardian name is required'),
    guardianRelation: z.string().min(1, 'Relation is required'),
    guardianPhone: z.string().min(1, 'Phone is required'),
    guardianEmail: z.string().email().optional().or(z.literal('')),
    guardianOccupation: z.string().optional(),
    previousSchool: z.string().optional(),
    previousClass: z.string().optional(),
    applyingForClass: z.string().min(1, 'Class is required'),
});

// Public action - no auth required
export async function submitAdmission(data: z.infer<typeof admissionSchema>) {
    try {
        const validated = admissionSchema.parse(data);

        const application = await prisma.admissionApplication.create({
            data: {
                branchId: validated.branchId,
                studentName: validated.studentName,
                dateOfBirth: new Date(validated.dateOfBirth),
                gender: validated.gender as any,
                bloodGroup: validated.bloodGroup || null,
                religion: validated.religion || null,
                address: validated.address,
                guardianName: validated.guardianName,
                guardianRelation: validated.guardianRelation,
                guardianPhone: validated.guardianPhone,
                guardianEmail: validated.guardianEmail || null,
                guardianOccupation: validated.guardianOccupation || null,
                previousSchool: validated.previousSchool || null,
                previousClass: validated.previousClass || null,
                applyingForClass: validated.applyingForClass,
            },
        });

        return { success: true, applicationId: application.id };
    } catch (error) {
        console.error('Failed to submit admission:', error);
        return { error: 'Failed to submit application. Please try again.' };
    }
}

// Admin actions
export async function getAdmissionApplications(status?: string) {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.admissionApplication.findMany({
        where: {
            branchId: session.user.branchId,
            ...(status && status !== 'ALL' ? { status: status as any } : {}),
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function updateApplicationStatus(
    id: string,
    status: string,
    reviewNotes?: string
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.admissionApplication.update({
            where: { id },
            data: {
                status: status as any,
                reviewNotes: reviewNotes || null,
                reviewedById: session.user.id,
                reviewedAt: new Date(),
            },
        });

        revalidatePath('/admin/admissions');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update status' };
    }
}

// Get available branches for public form
export async function getBranchesForAdmission() {
    return prisma.branch.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    });
}
