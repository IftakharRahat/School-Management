'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Get first branch ID (fallback)
export async function getFirstBranch(): Promise<string | null> {
    const branch = await prisma.branch.findFirst({
        orderBy: { createdAt: 'asc' },
    });
    return branch?.id || null;
}

// Validation schema
const subjectSchema = z.object({
    name: z.string().min(1, 'Subject name is required'),
    code: z.string().min(1, 'Subject code is required'),
    classId: z.string().min(1, 'Class is required'),
    creditHours: z.number().min(0).default(1),
    isOptional: z.boolean().default(false),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

// Get all subjects with class info
export async function getSubjects({
    branchId,
    classId,
    search = '',
}: {
    branchId: string;
    classId?: string;
    search?: string;
}) {
    const where: any = {
        class: { branchId },
    };

    if (classId) {
        where.classId = classId;
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
        ];
    }

    return prisma.subject.findMany({
        where,
        include: {
            class: true,
            _count: {
                select: { assignments: true },
            },
        },
        orderBy: [
            { class: { grade: 'asc' } },
            { name: 'asc' },
        ],
    });
}

// Get single subject
export async function getSubject(id: string) {
    return prisma.subject.findUnique({
        where: { id },
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: {
                        include: { user: true },
                    },
                },
            },
        },
    });
}

// Create subject
export async function createSubject(data: SubjectFormData) {
    const validated = subjectSchema.parse(data);

    const subject = await prisma.subject.create({
        data: {
            classId: validated.classId,
            name: validated.name,
            code: validated.code,
            creditHours: validated.creditHours,
            isOptional: validated.isOptional,
        },
    });

    revalidatePath('/admin/subjects');
    return subject;
}

// Update subject
export async function updateSubject(id: string, data: Partial<SubjectFormData>) {
    const updated = await prisma.subject.update({
        where: { id },
        data: {
            name: data.name,
            code: data.code,
            creditHours: data.creditHours,
            isOptional: data.isOptional,
        },
    });

    revalidatePath('/admin/subjects');
    revalidatePath(`/admin/subjects/${id}`);
    return updated;
}

// Delete subject
export async function deleteSubject(id: string) {
    await prisma.subject.delete({ where: { id } });
    revalidatePath('/admin/subjects');
}

// Get classes for dropdown
export async function getClassesForSubject(branchId: string) {
    return prisma.class.findMany({
        where: { branchId },
        orderBy: { grade: 'asc' },
    });
}
