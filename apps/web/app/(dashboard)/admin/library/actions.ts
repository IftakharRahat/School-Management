'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Categories
export async function getCategories() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.bookCategory.findMany({
        where: { branchId: session.user.branchId },
        include: { _count: { select: { books: true } } },
        orderBy: { name: 'asc' },
    });
}

export async function createCategory(name: string, description?: string) {
    const session = await auth();
    if (!session?.user?.branchId) return { error: 'Unauthorized' };

    try {
        await prisma.bookCategory.create({
            data: {
                branchId: session.user.branchId,
                name,
                description: description || null,
            },
        });
        revalidatePath('/admin/library');
        return { success: true };
    } catch (error: any) {
        if (error?.code === 'P2002') return { error: 'Category already exists' };
        return { error: 'Failed to create category' };
    }
}

// Books
export async function getBooks(categoryId?: string, search?: string) {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.book.findMany({
        where: {
            branchId: session.user.branchId,
            ...(categoryId && { categoryId }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { author: { contains: search, mode: 'insensitive' } },
                    { isbn: { contains: search, mode: 'insensitive' } },
                ],
            }),
        },
        include: { category: true },
        orderBy: { title: 'asc' },
    });
}

const bookSchema = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    categoryId: z.string().optional(),
    isbn: z.string().optional(),
    publisher: z.string().optional(),
    publishYear: z.number().optional(),
    quantity: z.number().min(1).default(1),
    location: z.string().optional(),
});

export async function createBook(data: z.infer<typeof bookSchema>) {
    const session = await auth();
    if (!session?.user?.branchId) return { error: 'Unauthorized' };

    try {
        await prisma.book.create({
            data: {
                branchId: session.user.branchId,
                title: data.title,
                author: data.author,
                categoryId: data.categoryId || null,
                isbn: data.isbn || null,
                publisher: data.publisher || null,
                publishYear: data.publishYear || null,
                quantity: data.quantity,
                available: data.quantity,
                location: data.location || null,
            },
        });
        revalidatePath('/admin/library');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to add book' };
    }
}

export async function deleteBook(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.book.delete({ where: { id } });
        revalidatePath('/admin/library');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete book' };
    }
}

// Issue/Return
export async function getActiveIssues() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.bookIssue.findMany({
        where: {
            book: { branchId: session.user.branchId },
            status: { in: ['ISSUED', 'OVERDUE'] },
        },
        include: {
            book: true,
            student: { include: { user: { select: { name: true } } } },
        },
        orderBy: { dueDate: 'asc' },
    });
}

export async function issueBook(bookId: string, studentId: string, daysToReturn: number = 14) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book || book.available < 1) return { error: 'Book not available' };

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysToReturn);

        await prisma.$transaction([
            prisma.bookIssue.create({
                data: {
                    bookId,
                    studentId,
                    issuedById: session.user.id,
                    dueDate,
                },
            }),
            prisma.book.update({
                where: { id: bookId },
                data: { available: { decrement: 1 } },
            }),
        ]);

        revalidatePath('/admin/library');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to issue book' };
    }
}

export async function returnBook(issueId: string, fine?: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        const issue = await prisma.bookIssue.findUnique({ where: { id: issueId } });
        if (!issue) return { error: 'Issue not found' };

        await prisma.$transaction([
            prisma.bookIssue.update({
                where: { id: issueId },
                data: {
                    status: 'RETURNED',
                    returnDate: new Date(),
                    fine: fine || null,
                },
            }),
            prisma.book.update({
                where: { id: issue.bookId },
                data: { available: { increment: 1 } },
            }),
        ]);

        revalidatePath('/admin/library');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to return book' };
    }
}

// Get all students for issue dropdown
export async function getStudentsForLibrary() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.student.findMany({
        where: { branchId: session.user.branchId },
        select: {
            id: true,
            admissionNo: true,
            user: { select: { name: true } },
        },
        orderBy: { user: { name: 'asc' } },
    });
}
