'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const announcementSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    type: z.enum(['GENERAL', 'EXAM', 'EVENT', 'HOLIDAY', 'EMERGENCY']).default('GENERAL'),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    endDate: z.string().nullable().optional(),
});

export async function getAnnouncements() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.announcement.findMany({
        where: {
            branchId: session.user.branchId,
            isPublished: true,
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } },
            ],
        },
        orderBy: [
            { priority: 'desc' },
            { startDate: 'desc' },
        ],
    });
}

export async function createAnnouncement(data: z.infer<typeof announcementSchema>) {
    const session = await auth();
    if (!session?.user?.branchId || !session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const validated = announcementSchema.parse(data);

        await prisma.announcement.create({
            data: {
                branchId: session.user.branchId,
                title: validated.title,
                content: validated.content,
                type: validated.type as any,
                priority: validated.priority as any,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                isPublished: true,
            },
        });

        revalidatePath('/admin/announcements');
        return { success: true };
    } catch (error) {
        console.error('Failed to create announcement:', error);
        return { error: 'Failed to create announcement' };
    }
}

export async function deleteAnnouncement(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.announcement.delete({ where: { id } });
        revalidatePath('/admin/announcements');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete announcement' };
    }
}

export async function togglePublished(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        const announcement = await prisma.announcement.findUnique({ where: { id } });
        if (!announcement) return { error: 'Not found' };

        await prisma.announcement.update({
            where: { id },
            data: { isPublished: !announcement.isPublished },
        });

        revalidatePath('/admin/announcements');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to toggle published status' };
    }
}
