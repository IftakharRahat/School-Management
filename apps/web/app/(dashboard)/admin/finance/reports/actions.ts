'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export async function getMonthlyReport(month: number, year: number) {
    const session = await auth();
    if (!session?.user?.branchId) return null;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Get all fee payments for the month
    const payments = await prisma.feePayment.findMany({
        where: {
            dueDate: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
            student: {
                branchId: session.user.branchId,
            },
        },
        include: {
            student: {
                include: {
                    user: { select: { name: true } },
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        include: {
                            section: {
                                include: { class: true },
                            },
                        },
                        take: 1,
                    },
                },
            },
            feeHead: true,
        },
        orderBy: { dueDate: 'asc' },
    });

    // Summary by fee head
    const byFeeHead: Record<string, { name: string; total: number; paid: number; pending: number }> = {};

    for (const p of payments) {
        if (!byFeeHead[p.feeHeadId]) {
            byFeeHead[p.feeHeadId] = {
                name: p.feeHead.name,
                total: 0,
                paid: 0,
                pending: 0,
            };
        }
        byFeeHead[p.feeHeadId].total += p.amount;
        if (p.status === 'PAID') {
            byFeeHead[p.feeHeadId].paid += p.amount;
        } else {
            byFeeHead[p.feeHeadId].pending += p.amount;
        }
    }

    // Summary totals
    const totalDue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = totalDue - totalPaid;
    const collectionRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    return {
        month,
        year,
        startOfMonth,
        endOfMonth,
        totalDue,
        totalPaid,
        totalPending,
        collectionRate: Math.round(collectionRate * 10) / 10,
        byFeeHead: Object.values(byFeeHead),
        payments,
    };
}

export async function getDefaultersList(asOfDate?: Date) {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    const date = asOfDate || new Date();

    // Find all unpaid payments with due date before today
    const defaulters = await prisma.feePayment.findMany({
        where: {
            dueDate: { lt: date },
            status: { in: ['PENDING', 'OVERDUE'] },
            student: {
                branchId: session.user.branchId,
            },
        },
        include: {
            student: {
                include: {
                    user: { select: { name: true, phone: true } },
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        include: {
                            section: {
                                include: { class: true },
                            },
                        },
                        take: 1,
                    },
                },
            },
            feeHead: true,
        },
        orderBy: [
            { dueDate: 'asc' },
        ],
    });

    // Group by student
    const byStudent: Record<string, {
        studentId: string;
        name: string;
        phone: string | null;
        class: string;
        section: string;
        totalDue: number;
        fees: Array<{ feeHead: string; amount: number; dueDate: Date }>;
    }> = {};

    for (const d of defaulters) {
        if (!byStudent[d.studentId]) {
            byStudent[d.studentId] = {
                studentId: d.studentId,
                name: d.student.user?.name || 'Unknown',
                phone: d.student.user?.phone || null,
                class: d.student.enrollments?.[0]?.section?.class?.name || '',
                section: d.student.enrollments?.[0]?.section?.name || '',
                totalDue: 0,
                fees: [],
            };
        }
        byStudent[d.studentId].totalDue += d.amount;
        byStudent[d.studentId].fees.push({
            feeHead: d.feeHead.name,
            amount: d.amount,
            dueDate: d.dueDate,
        });
    }

    return Object.values(byStudent).sort((a, b) => b.totalDue - a.totalDue);
}
