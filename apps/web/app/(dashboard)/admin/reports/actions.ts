'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from 'date-fns';

// ==========================================
// REPORT CARD ACTIONS
// ==========================================

export async function getClasses() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.class.findMany({
        where: { branchId: session.user.branchId },
        include: { sections: true },
        orderBy: { name: 'asc' }
    });
}

export async function getExams(classId: string) {
    if (!classId) return [];
    return prisma.exam.findMany({
        where: { classId },
        orderBy: { startDate: 'desc' }
    });
}

export async function getStudentResults(examId: string, sectionId?: string) {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    const whereClause: any = {
        examId,
        student: {
            branchId: session.user.branchId,
        }
    };

    if (sectionId) {
        // If filtering by section, we need to check enrollments
        whereClause.student.enrollments = {
            some: {
                sectionId: sectionId,
                status: 'ACTIVE'
            }
        };
    }

    // Get all results for this exam
    const results = await prisma.result.findMany({
        where: whereClause,
        include: {
            student: {
                include: {
                    // rollNo is included by default as it is a scalar
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        take: 1,
                        include: {
                            section: {
                                include: { class: true }
                            }
                        }
                    }
                }
            },
            subject: true
        }
    });

    // Group by student
    const studentResults = new Map();

    results.forEach(result => {
        if (!studentResults.has(result.studentId)) {
            const enrollment = result.student.enrollments[0];
            studentResults.set(result.studentId, {
                student: {
                    ...result.student,
                    class: enrollment?.section?.class,
                    section: enrollment?.section
                },
                results: []
            });
        }
        studentResults.get(result.studentId).results.push({
            subject: result.subject.name,
            marks: result.marksObtained,
            total: result.totalMarks,
            grade: result.grade
        });
    });

    return Array.from(studentResults.values());
}


// ==========================================
// FEE SUMMARY ACTIONS
// ==========================================

export async function getFeeStats(start: Date, end: Date) {
    const session = await auth();
    if (!session?.user?.branchId) return { total: 0, count: 0, byMethod: [], daily: [] };

    const payments = await prisma.feePayment.findMany({
        where: {
            student: { branchId: session.user.branchId },
            status: 'PAID',
            paidDate: {
                gte: start,
                lte: end
            }
        }
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;

    // Group by Method
    const byMethodRaw = payments.reduce((acc: any, curr) => {
        const method = curr.method || 'UNKNOWN';
        acc[method] = (acc[method] || 0) + curr.amount;
        return acc;
    }, {});

    const byMethod = Object.entries(byMethodRaw).map(([name, value]) => ({ name, value }));

    // By Date (Daily)
    const dailyRaw = payments.reduce((acc: any, curr) => {
        const date = curr.paidDate?.toISOString().split('T')[0] || 'Unknown';
        acc[date] = (acc[date] || 0) + curr.amount;
        return acc;
    }, {});

    const daily = Object.entries(dailyRaw)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return { total, count, byMethod, daily };
}

// ==========================================
// ATTENDANCE ANALYTICS ACTIONS
// ==========================================

export async function getAttendanceAnalytics() {
    const session = await auth();
    if (!session?.user?.branchId) return { today: [], lowAttendance: [] };

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // 1. Class-wise Attendance Today
    const attendanceToday = await prisma.attendance.findMany({
        where: {
            date: { gte: todayStart, lte: todayEnd },
            student: { branchId: session.user.branchId }
        },
        include: {
            student: {
                include: {
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        take: 1,
                        include: {
                            section: {
                                include: { class: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // Group by class
    const classStats = new Map();
    attendanceToday.forEach(record => {
        const enrollment = record.student?.enrollments[0];
        const className = enrollment?.section?.class?.name || 'Unknown';

        if (!classStats.has(className)) {
            classStats.set(className, { present: 0, total: 0 });
        }
        const stats = classStats.get(className);
        stats.total++;
        if (record.status === 'PRESENT') stats.present++;
    });

    const todayStats = Array.from(classStats.entries()).map(([className, stats]) => ({
        className,
        percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));

    // 2. Low Attendance Students (Last 30 Days)
    // Fetch aggregated attendance counts for each student
    // NOTE: This can be heavy, for now we limit to simple "absent count" logic or query raw if needed
    // Let's implement active students with < 75% attendance in current month
    const monthStart = startOfMonth(new Date());

    const monthlyAttendance = await prisma.attendance.findMany({
        where: {
            date: { gte: monthStart },
            student: { branchId: session.user.branchId }
        },
        select: {
            studentId: true,
            status: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    admissionNo: true,
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        take: 1,
                        select: {
                            section: {
                                select: {
                                    class: { select: { name: true } }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const studentStats = new Map();
    monthlyAttendance.forEach(record => {
        if (!studentStats.has(record.studentId)) {
            const enrollment = record.student?.enrollments[0];
            const className = enrollment?.section?.class?.name || 'Unknown';

            studentStats.set(record.studentId, {
                name: record.student.name,
                class: className,
                admissionNo: record.student.admissionNo,
                total: 0,
                present: 0
            });
        }
        const stats = studentStats.get(record.studentId);
        stats.total++;
        if (record.status === 'PRESENT') stats.present++;
    });

    const lowAttendance = Array.from(studentStats.values())
        .map((s: any) => ({
            ...s,
            percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
        }))
        .filter((s: any) => s.percentage < 75)
        .sort((a: any, b: any) => a.percentage - b.percentage)
        .slice(0, 10); // Top 10 worst

    return { today: todayStats, lowAttendance };
}
