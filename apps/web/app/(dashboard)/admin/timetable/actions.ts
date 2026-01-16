'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ==========================================
// TIMETABLE ACTIONS
// ==========================================

export async function getTimetable(sectionId: string) {
    return prisma.timetableSlot.findMany({
        where: { sectionId },
        include: {
            subject: true,
            teacher: { include: { user: true } },
        },
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
        ],
    });
}

// Check for conflicts
async function checkConflicts(
    teacherId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeSlotId?: string
) {
    const conflicts = await prisma.timetableSlot.findFirst({
        where: {
            teacherId,
            dayOfWeek,
            // Check time overlap: (StartA < EndB) and (EndA > StartB)
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            // Exclude current slot if updating
            id: excludeSlotId ? { not: excludeSlotId } : undefined,
        },
        include: {
            section: { include: { class: true } }
        }
    });

    return conflicts;
}

export async function upsertTimetableSlot({
    sectionId,
    subjectId,
    teacherId,
    dayOfWeek,
    startTime,
    endTime,
    slotId
}: {
    sectionId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotId?: string; // If present, update
}) {
    // 1. Check Teacher Availability
    const conflict = await checkConflicts(teacherId, dayOfWeek, startTime, endTime, slotId);

    if (conflict) {
        throw new Error(`Teacher is already booked in ${conflict.section.class.name} - ${conflict.section.name} at this time.`);
    }

    // 2. Upsert
    if (slotId) {
        // Update
        const updated = await prisma.timetableSlot.update({
            where: { id: slotId },
            data: {
                subjectId,
                teacherId,
                startTime,
                endTime,
            }
        });
        revalidatePath('/admin/timetable');
        return updated;
    } else {
        // Create
        // First check if a slot already exists for THIS section at this time (overwrite or error?)
        // Ideally we shouldn't have two overlaps for the same section either.
        const sectionConflict = await prisma.timetableSlot.findFirst({
            where: {
                sectionId,
                dayOfWeek,
                startTime: { lt: endTime },
                endTime: { gt: startTime },
            }
        });

        if (sectionConflict) {
            throw new Error('This section already has a class scheduled at this time.');
        }

        const created = await prisma.timetableSlot.create({
            data: {
                sectionId,
                subjectId,
                teacherId,
                dayOfWeek,
                startTime,
                endTime,
            }
        });
        revalidatePath('/admin/timetable');
        return created;
    }
}

export async function deleteTimetableSlot(id: string) {
    await prisma.timetableSlot.delete({ where: { id } });
    revalidatePath('/admin/timetable');
}

// Get available master data
export async function getTimetableMasterData(branchId: string) {
    const [classes, teachers, subjects] = await Promise.all([
        prisma.class.findMany({
            where: { branchId },
            include: { sections: { orderBy: { name: 'asc' } } },
            orderBy: { grade: 'asc' },
        }),
        prisma.teacher.findMany({
            where: { branchId },
            include: { user: true },
            orderBy: { user: { name: 'asc' } },
        }),
        prisma.subject.findMany({
            where: { class: { branchId } }, // Subjects are class-specific, getting all branch subjects might be messy but needed for options
            include: { class: true },
            orderBy: { name: 'asc' },
        })
    ]);

    return { classes, teachers, subjects };
}
