import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const body = await request.json();
    const { sectionId, date, attendance } = body;

    if (!sectionId || !date || !attendance || !Array.isArray(attendance)) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Create or update attendance records
    const results = await Promise.all(
        attendance.map(async (record: { studentId: string; status: string }) => {
            try {
                // Check if attendance already exists for this student on this date
                const existing = await prisma.attendance.findFirst({
                    where: {
                        studentId: record.studentId,
                        date: attendanceDate
                    }
                });

                if (existing) {
                    // Update existing
                    return prisma.attendance.update({
                        where: { id: existing.id },
                        data: {
                            status: record.status as any,
                            sectionId: sectionId
                        }
                    });
                } else {
                    // Create new - include required type field
                    return prisma.attendance.create({
                        data: {
                            studentId: record.studentId,
                            sectionId: sectionId,
                            date: attendanceDate,
                            type: 'STUDENT',
                            status: record.status as any
                        }
                    });
                }
            } catch (err) {
                console.error('Error saving attendance for student:', record.studentId, err);
                return null;
            }
        })
    );

    return NextResponse.json({
        success: true,
        count: results.filter(r => r !== null).length
    });
}
