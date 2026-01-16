'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function getStudentPendingFees(studentId: string) {
    const session = await auth();
    if (!session?.user?.branchId) return null;

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: { select: { name: true } },
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: {
                            class: true,
                        },
                    },
                },
                take: 1,
            },
            feePayments: {
                include: {
                    feeHead: true,
                },
                orderBy: { dueDate: 'asc' },
            },
        },
    });

    return student;
}

export async function searchStudents(query: string) {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    if (!query || query.length < 2) return [];

    return await prisma.student.findMany({
        where: {
            branchId: session.user.branchId,
            OR: [
                { user: { name: { contains: query, mode: 'insensitive' } } },
                { rollNo: { contains: query, mode: 'insensitive' } },
                { admissionNo: { contains: query, mode: 'insensitive' } },
            ],
        },
        include: {
            user: { select: { name: true } },
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: {
                            class: true,
                        },
                    },
                },
                take: 1,
            },
        },
        take: 10,
    });
}

export async function generateStudentFees(studentId: string, month: number, year: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    // Get the student's current class from their active enrollment
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: {
                            class: true,
                        },
                    },
                },
                take: 1,
            },
        },
    });

    const classId = student?.enrollments?.[0]?.section?.classId;

    if (!classId) {
        return { error: 'Student has no class assigned' };
    }

    // Get all fee structures for this class
    const structures = await prisma.feeStructure.findMany({
        where: { classId },
        include: { feeHead: true },
    });

    if (structures.length === 0) {
        return { error: 'No fee structure defined for this class' };
    }

    const dueDate = new Date(year, month - 1, 10); // Due on the 10th

    let created = 0;
    for (const struct of structures) {
        // Skip if fee already exists for this student, fee head, and month
        const existing = await prisma.feePayment.findFirst({
            where: {
                studentId,
                feeHeadId: struct.feeHeadId,
                dueDate: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
            },
        });

        if (!existing) {
            await prisma.feePayment.create({
                data: {
                    studentId,
                    feeHeadId: struct.feeHeadId,
                    amount: struct.amount,
                    dueDate,
                    status: 'PENDING',
                },
            });
            created++;
        }
    }

    revalidatePath('/admin/finance/collect');
    return { success: true, created };
}

export async function collectPayment(paymentId: string, method: string, transactionId?: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.feePayment.update({
            where: { id: paymentId },
            data: {
                status: 'PAID',
                paidDate: new Date(),
                method: method as any,
                transactionId: transactionId || null,
            },
        });
        revalidatePath('/admin/finance/collect');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to collect payment' };
    }
}

export async function getMonthlyFeeStats() {
    const session = await auth();
    if (!session?.user?.branchId) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalDue, totalCollected] = await Promise.all([
        prisma.feePayment.aggregate({
            where: {
                dueDate: { gte: startOfMonth, lte: endOfMonth },
            },
            _sum: { amount: true },
        }),
        prisma.feePayment.aggregate({
            where: {
                paidDate: { gte: startOfMonth, lte: endOfMonth },
                status: 'PAID',
            },
            _sum: { amount: true },
        }),
    ]);

    return {
        totalDue: totalDue._sum.amount || 0,
        totalCollected: totalCollected._sum.amount || 0,
    };
}
