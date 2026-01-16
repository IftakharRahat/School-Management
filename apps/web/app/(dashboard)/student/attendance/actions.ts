'use server';

import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';

export async function getStudentAttendance(studentId?: string) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    let targetStudentId = studentId;

    // If student user, force their own ID
    if (session.user.role === 'STUDENT') {
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id }
        });
        if (!student) throw new Error('Student profile not found');
        targetStudentId = student.id;
    }

    if (!targetStudentId) throw new Error('Student ID required');

    // Fetch master attendance records for this student
    const attendance = await prisma.attendance.findMany({
        where: {
            studentId: targetStudentId,
            type: 'STUDENT'
        },
        orderBy: { date: 'desc' }
    });

    // Calculate summary stats
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;

    // Percentage
    // Note: Total school days usually > logged attendance if implementation is strict.
    // For now, we calculate based on *recorded* days.
    const percentage = total > 0 ? ((present + late) / total) * 100 : 100;

    return {
        records: attendance,
        stats: {
            total,
            present,
            absent,
            late,
            percentage: Math.round(percentage * 10) / 10
        }
    };
}
