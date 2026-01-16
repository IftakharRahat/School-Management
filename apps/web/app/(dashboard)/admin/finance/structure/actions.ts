'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getFeeStructures() {
    const session = await auth();
    if (!session?.user?.branchId) return { classes: [], feeHeads: [], structures: [] };

    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' }, // Should probably sort by numerical order if possible
    });

    const feeHeads = await prisma.feeHead.findMany({
        orderBy: { name: 'asc' },
    });

    const structures = await prisma.feeStructure.findMany();

    return { classes, feeHeads, structures };
}

export async function saveFeeStructure(classId: string, feeHeadId: string, amount: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.feeStructure.upsert({
            where: {
                classId_feeHeadId: {
                    classId,
                    feeHeadId,
                },
            },
            update: {
                amount,
            },
            create: {
                classId,
                feeHeadId,
                amount,
            },
        });
        revalidatePath('/admin/finance/structure');
        return { success: true };
    } catch (error) {
        console.error('Failed to save fee structure:', error);
        return { error: 'Failed to update fee' };
    }
}
