'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const examSchema = z.object({
    name: z.string().min(1, "Name is required"),
    classId: z.string().min(1, "Class is required"),
    type: z.enum(["FIRST_TERM", "HALF_YEARLY", "FINAL", "UNIT_TEST", "CLASS_TEST"]),
    startDate: z.string(),
    endDate: z.string().optional().nullable().or(z.literal('')),
});

export async function getExams(branchId: string) {
    return prisma.exam.findMany({
        where: {
            class: { branchId }
        },
        include: {
            class: true,
            _count: {
                select: { examSubjects: true }
            }
        },
        orderBy: { startDate: 'desc' }
    });
}

async function getCurrentAcademicYear(branchId: string) {
    let year = await prisma.academicYear.findFirst({
        where: { branchId, isCurrent: true }
    });

    if (!year) {
        // Fallback or create default? 
        // For now, let's look for ANY year, or create one for 2026 (or current)
        const currentYearName = new Date().getFullYear().toString();
        year = await prisma.academicYear.findFirst({
            where: { branchId, name: currentYearName }
        });

        if (!year) {
            year = await prisma.academicYear.create({
                data: {
                    branchId,
                    name: currentYearName,
                    startDate: new Date(new Date().getFullYear(), 0, 1),
                    endDate: new Date(new Date().getFullYear(), 11, 31),
                    isCurrent: true
                }
            });
        }
    }
    return year;
}

export async function createExam(branchId: string, data: any) {
    console.log("Creating exam with data:", data);
    try {
        const validated = examSchema.parse(data);
        console.log("Validation passed");

        const academicYear = await getCurrentAcademicYear(branchId);
        console.log("Academic Year found/created:", academicYear);

        // Create the exam
        const exam = await prisma.exam.create({
            data: {
                name: validated.name,
                classId: validated.classId,
                type: validated.type as any, // Cast to avoid enum mismatch if any
                startDate: new Date(validated.startDate),
                endDate: validated.endDate ? new Date(validated.endDate) : undefined,
                academicYearId: academicYear.id,
            }
        });
        console.log("Exam created:", exam.id);

        // Auto-populate ExamSubjects based on Class Subjects
        // This makes it easier for users - they just edit marks/dates later
        const subjects = await prisma.subject.findMany({
            where: { classId: validated.classId }
        });
        console.log("Found subjects to link:", subjects.length);

        if (subjects.length > 0) {
            await prisma.examSubject.createMany({
                data: subjects.map(s => ({
                    examId: exam.id,
                    subjectId: s.id,
                    fullMarks: 100, // Default
                    passMarks: 33,  // Default
                }))
            });
        }

        revalidatePath('/admin/exams');
        return exam;
    } catch (error) {
        console.error("Error creating exam:", error);
        throw error; // Re-throw so UI sees it
    }
}

export async function deleteExam(id: string) {
    try {
        await prisma.exam.delete({ where: { id } });
        revalidatePath('/admin/exams');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete' };
    }
}
