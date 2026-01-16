'use server';

import { prisma } from '@repo/database';

export async function getMonthlyAttendanceReport(
    branchId: string,
    classId: string,
    sectionId: string,
    month: number, // 1-12
    year: number
) {
    if (!classId || !sectionId) return [];

    // 1. Get all students in the section
    const students = await prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    sectionId,
                    status: 'ACTIVE', // Or matching historical enrollment? For now active.
                }
            }
        },
        include: {
            user: true,
            enrollments: {
                where: { sectionId, status: 'ACTIVE' },
                take: 1
            }
        },
        orderBy: {
            enrollments: { _count: 'desc' } // Proxy for likely sort
        }
    });

    // 2. Get date range
    // JS dates are 0-indexed for month? No, inputs usually 1-indexed. Let's assume input 1-12.
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0); // Last day of month

    // 3. Get all attendance records for this range
    const attendanceRecords = await prisma.attendance.findMany({
        where: {
            sectionId,
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            type: 'STUDENT'
        }
    });

    // 4. Construct report matrix
    // Return: { student: {...}, attendance: { [day]: status } }

    return students.map(student => {
        const studentRecords = attendanceRecords.filter(r => r.studentId === student.id);

        // Map day number (1-31) to status
        const attendanceMap: Record<number, string> = {};
        studentRecords.forEach(r => {
            const day = r.date.getDate();
            attendanceMap[day] = r.status; // PRESENT, ABSENT, etc.
        });

        const presentCount = studentRecords.filter(r => r.status === 'PRESENT').length;
        const absentCount = studentRecords.filter(r => r.status === 'ABSENT').length;
        const lateCount = studentRecords.filter(r => r.status === 'LATE').length;

        return {
            studentId: student.id,
            name: student.user.name,
            rollNo: student.enrollments[0]?.rollNumber || '-',
            attendance: attendanceMap,
            stats: {
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                total: presentCount + absentCount + lateCount // Total recorded days
            }
        };
    }).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
}
