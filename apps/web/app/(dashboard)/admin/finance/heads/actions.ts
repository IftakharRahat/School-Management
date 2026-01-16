'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const feeHeadSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    frequency: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
    isOptional: z.boolean().default(false),
});

export async function getFeeHeads() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    // Assuming FeeHeads are global for now, or we can filter by branch if needed later.
    // For now, fetching all checks.
    // TODO: Add branchId to FeeHead if we want branch-specific fees.

    return await prisma.feeHead.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function createFeeHead(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const rawData = {
        name: formData.get('name'),
        frequency: formData.get('frequency'),
        isOptional: formData.get('isOptional') === 'on',
    };

    const validatedFields = feeHeadSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        await prisma.feeHead.create({
            data: {
                name: validatedFields.data.name,
                frequency: validatedFields.data.frequency,
                isOptional: validatedFields.data.isOptional,
                amount: null, // Default to null, will be set in structure
            },
        });
        revalidatePath('/admin/finance/heads');
        return { success: true };
    } catch (error) {
        console.error('Failed to create fee head:', error);
        return { error: 'Failed to create fee head' };
    }
}

export async function deleteFeeHead(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.feeHead.delete({
            where: { id },
        });
        revalidatePath('/admin/finance/heads');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete fee head' };
    }
}
