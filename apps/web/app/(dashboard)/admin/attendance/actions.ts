'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';

export interface AttendanceRecord {
    studentId: string;
    studentName: string;
    rollNo: string | null;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY';
    remarks?: string;
}

// Get attendance sheet for a specific section and date
export async function getAttendanceSheet(sectionId: string, date: Date) {
    // 1. Get all active students in the section
    const students = await prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    sectionId,
                    status: 'ACTIVE',
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
            enrollments: {
                _count: 'desc' // Hacky way to sort? Better to sort by rollNo info if available, or name
            }
        }
    });

    // 2. Get existing attendance for this date
    // Normalize date to start of day or store as provided?
    // Usually best to store as Midnight UTC or Local to avoid time part issues.
    // For simplicity, we assume the helper passes a normalized date object.
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // We search for attendance records that match the date (ignoring time if stored with time, but simple approach is strict equality if inputs are clean)
    // Actually, Prisma DateTime filter is exact. We should search by range or just exact if we consistently normalize.
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.attendance.findMany({
        where: {
            sectionId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            type: 'STUDENT'
        }
    });

    // 3. Merge data
    const sheet: AttendanceRecord[] = students.map(student => {
        const record = existingAttendance.find(a => a.studentId === student.id);
        const enrollment = student.enrollments[0]; // Exist because of filter

        return {
            studentId: student.id,
            studentName: student.user.name,
            rollNo: enrollment?.rollNumber || null,
            status: record ? record.status : 'PRESENT', // Default to PRESENT if no record
            remarks: record?.remarks || '',
        };
    });

    // Sort by Roll No if possible, else Name
    return sheet.sort((a, b) => {
        if (a.rollNo && b.rollNo) return a.rollNo.localeCompare(b.rollNo);
        return a.studentName.localeCompare(b.studentName);
    });
}

export async function saveAttendance(
    sectionId: string,
    date: Date,
    records: { studentId: string; status: any; remarks?: string }[]
) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Using transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
        for (const record of records) {
            await tx.attendance.upsert({
                where: {
                    date_studentId: {
                        date: startOfDay,
                        studentId: record.studentId
                    }
                },
                update: {
                    status: record.status,
                    remarks: record.remarks,
                    type: 'STUDENT',
                    sectionId // Ensure sectionId is consistent
                },
                create: {
                    date: startOfDay,
                    studentId: record.studentId,
                    sectionId,
                    type: 'STUDENT',
                    status: record.status,
                    remarks: record.remarks
                }
            });
        }
    });

    revalidatePath('/admin/attendance');
}

// Helper to get master data for dropdowns
export async function getAttendanceMasterData(branchId: string) {
    return prisma.class.findMany({
        where: { branchId },
        include: {
            sections: { orderBy: { name: 'asc' } }
        },
        orderBy: { grade: 'asc' }
    });
}
