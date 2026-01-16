'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function getExamSchedule(examId: string) {
    const session = await auth();
    if (!session?.user?.branchId) return null;

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
            class: true,
            examSubjects: {
                include: {
                    subject: true,
                },
                orderBy: { examDate: 'asc' },
            },
        },
    });

    return exam;
}

export async function updateExamSubjectSchedule(
    examSubjectId: string,
    data: { examDate?: string; startTime?: string; endTime?: string }
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.examSubject.update({
            where: { id: examSubjectId },
            data: {
                examDate: data.examDate ? new Date(data.examDate) : undefined,
            },
        });

        revalidatePath('/admin/exams');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update schedule' };
    }
}

export async function updateBulkSchedule(
    updates: Array<{ id: string; examDate: string | null }>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        for (const update of updates) {
            await prisma.examSubject.update({
                where: { id: update.id },
                data: {
                    examDate: update.examDate ? new Date(update.examDate) : null,
                },
            });
        }

        revalidatePath('/admin/exams');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update schedule' };
    }
}
