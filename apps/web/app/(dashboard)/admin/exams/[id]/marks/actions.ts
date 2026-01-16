'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function getExamDetails(examId: string) {
    return prisma.exam.findUnique({
        where: { id: examId },
        include: {
            class: {
                include: {
                    sections: true
                }
            },
            academicYear: true
        }
    });
}

export async function getExamSubjects(examId: string) {
    return prisma.examSubject.findMany({
        where: { examId },
        include: {
            subject: true
        }
    });
}

export async function getExamResults(examId: string, subjectId: string, sectionId?: string) {
    // 1. Get all students in the class/section
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: { classId: true }
    });

    if (!exam) throw new Error("Exam not found");

    const students = await prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    section: {
                        classId: exam.classId,
                        ...(sectionId ? { id: sectionId } : {})
                    },
                    status: 'ACTIVE'
                }
            }
        },
        include: {
            user: true,
            enrollments: {
                where: {
                    section: { classId: exam.classId },
                    status: 'ACTIVE'
                },
                include: { section: true }
            }
        },
        orderBy: {
            enrollments: { _count: 'desc' } // Proxy order
        }
    });

    // 2. Get existing results for these students in this exam+subject
    const results = await prisma.result.findMany({
        where: {
            examId,
            subjectId,
            studentId: { in: students.map(s => s.id) }
        }
    });

    // 3. Merge
    return students.map(student => {
        const enrollment = student.enrollments[0];
        const result = results.find(r => r.studentId === student.id);

        return {
            studentId: student.id,
            name: student.user.name,
            rollNo: enrollment?.rollNumber || '-',
            sectionName: enrollment?.section.name || '-',
            marksObtained: result?.marksObtained ?? '',
            grade: result?.grade || '',
        };
    }).sort((a, b) => {
        // Sort by section then roll number
        if (a.sectionName !== b.sectionName) return a.sectionName.localeCompare(b.sectionName);
        return a.rollNo.localeCompare(b.rollNo);
    });
}

// Simple Grade Calculation (Can be moved to a util or DB config later)
function calculateGrade(marks: number) {
    if (marks >= 80) return { grade: 'A+', point: 5.0 };
    if (marks >= 70) return { grade: 'A', point: 4.0 };
    if (marks >= 60) return { grade: 'A-', point: 3.5 };
    if (marks >= 50) return { grade: 'B', point: 3.0 };
    if (marks >= 40) return { grade: 'C', point: 2.0 };
    if (marks >= 33) return { grade: 'D', point: 1.0 };
    return { grade: 'F', point: 0.0 };
}

export async function saveExamResults(
    examId: string,
    subjectId: string,
    data: { studentId: string; marks: number }[]
) {
    try {
        await prisma.$transaction(
            data.map(item => {
                const { grade, point } = calculateGrade(item.marks);

                return prisma.result.upsert({
                    where: {
                        examId_studentId_subjectId: {
                            examId,
                            studentId: item.studentId,
                            subjectId
                        }
                    },
                    update: {
                        marksObtained: item.marks,
                        grade,
                        gradePoint: point
                    },
                    create: {
                        examId,
                        studentId: item.studentId,
                        subjectId,
                        marksObtained: item.marks,
                        grade,
                        gradePoint: point
                    }
                });
            })
        );

        revalidatePath(`/admin/exams/${examId}/marks`);
        return { success: true };
    } catch (error) {
        console.error("Error saving results:", error);
        return { success: false, error: "Failed to save results" };
    }
}
