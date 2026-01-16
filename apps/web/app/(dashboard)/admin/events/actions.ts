'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getEvents(start?: Date, end?: Date) {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    const whereClause: any = { branchId: session.user.branchId };

    if (start && end) {
        whereClause.startDate = { gte: start, lte: end };
    }

    return prisma.event.findMany({
        where: whereClause,
        include: {
            _count: { select: { registrations: true } }
        },
        orderBy: { startDate: 'asc' },
    });
}

const eventSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    eventType: z.enum(['GENERAL', 'HOLIDAY', 'EXAM', 'MEETING', 'SPORTS', 'CULTURAL', 'PARENT_MEETING', 'ASSEMBLY']).default('GENERAL'),
    location: z.string().optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    allDay: z.boolean().default(false),
    color: z.string().optional(),
    isPublic: z.boolean().default(true),
    maxAttendees: z.number().optional(),
    requiresRegistration: z.boolean().default(false),
});

export async function createEvent(data: any) {
    const session = await auth();
    if (!session?.user?.branchId) return { error: 'Unauthorized' };

    try {
        await prisma.event.create({
            data: {
                branchId: session.user.branchId,
                title: data.title,
                description: data.description,
                eventType: data.eventType,
                location: data.location,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                allDay: data.allDay || false,
                color: data.color || '#3b82f6', // Default blue
                isPublic: data.isPublic !== false,
                requiresRegistration: data.requiresRegistration || false,
            }
        });
        revalidatePath('/admin/events');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to create event' };
    }
}

export async function deleteEvent(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.event.delete({ where: { id } });
        revalidatePath('/admin/events');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete event' };
    }
}
