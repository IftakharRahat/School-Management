'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';

// ==========================================
// ACADEMIC YEAR ACTIONS
// ==========================================

export async function getAcademicYears() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.academicYear.findMany({
        where: { branchId: session.user.branchId },
        orderBy: { startDate: 'desc' },
        include: { _count: { select: { enrollments: true } } }
    });
}

export async function createAcademicYear(data: { name: string; startDate: Date; endDate: Date; isCurrent: boolean }) {
    const session = await auth();
    if (!session?.user?.branchId) throw new Error("Unauthorized");

    try {
        if (data.isCurrent) {
            // Unset current for others
            await prisma.academicYear.updateMany({
                where: { branchId: session.user.branchId, isCurrent: true },
                data: { isCurrent: false }
            });
        }

        const year = await prisma.academicYear.create({
            data: {
                ...data,
                branchId: session.user.branchId
            }
        });

        revalidatePath('/admin/settings');
        return { success: true, data: year };
    } catch (error) {
        console.error("Failed to create academic year:", error);
        return { success: false, error: "Failed to create academic year" };
    }
}

export async function updateAcademicYear(id: string, data: { name?: string; startDate?: Date; endDate?: Date; isCurrent?: boolean }) {
    const session = await auth();
    if (!session?.user?.branchId) throw new Error("Unauthorized");

    try {
        if (data.isCurrent) {
            // Unset current for others (excluding this one implicitly by update logic order, but safer to do for all except self)
            await prisma.$transaction([
                prisma.academicYear.updateMany({
                    where: { branchId: session.user.branchId, isCurrent: true, id: { not: id } },
                    data: { isCurrent: false }
                }),
                prisma.academicYear.update({
                    where: { id },
                    data
                })
            ]);
        } else {
            await prisma.academicYear.update({
                where: { id },
                data
            });
        }

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update academic year:", error);
        return { success: false, error: "Failed to update academic year" };
    }
}

export async function deleteAcademicYear(id: string) {
    const session = await auth();
    if (!session?.user?.branchId) throw new Error("Unauthorized");

    // Check if used
    const year = await prisma.academicYear.findUnique({
        where: { id },
        include: { _count: { select: { enrollments: true, exams: true } } }
    });

    if (year && (year._count.enrollments > 0 || year._count.exams > 0)) {
        return { success: false, error: "Cannot delete active academic year with data." };
    }

    await prisma.academicYear.delete({ where: { id } });
    revalidatePath('/admin/settings');
    return { success: true };
}


// ==========================================
// BRANCH / GENERAL SETTINGS ACTIONS
// ==========================================

export async function getBranchDetails() {
    const session = await auth();
    if (!session?.user?.branchId) return null;

    return prisma.branch.findUnique({
        where: { id: session.user.branchId }
    });
}

export async function updateBranchDetails(data: { name: string; address?: string; phone?: string; email?: string; logo?: string }) {
    const session = await auth();
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.branch.update({
            where: { id: session.user.branchId },
            data
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update branch:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
