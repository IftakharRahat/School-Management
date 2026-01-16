'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { redirect } from 'next/navigation';

export async function getStudentExams() {
    const session = await auth();
    if (!session || !session.user.email) return [];

    // Find student record
    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            enrollments: {
                where: { status: 'ACTIVE' },
                include: { section: { include: { class: true } } },
                take: 1
            }
        }
    });

    if (!student || !student.enrollments[0]) return [];

    const classId = student.enrollments[0].section.classId;

    // Get exams for this class
    return prisma.exam.findMany({
        where: { classId },
        orderBy: { startDate: 'desc' }
    });
}

export async function getStudentResult(examId: string) {
    const session = await auth();
    if (!session) return null;

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
    });

    if (!student) return null;

    // 1. Get Exam Details
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { class: true }
    });

    if (!exam) return null;

    // 2. Get All Subjects for this exam (to show full marks/pass marks)
    const examSubjects = await prisma.examSubject.findMany({
        where: { examId },
        include: { subject: true }
    });

    // 3. Get Student's Results
    const results = await prisma.result.findMany({
        where: {
            examId,
            studentId: student.id
        }
    });

    // 4. Merge Data
    const formattedResults = examSubjects.map(es => {
        const result = results.find(r => r.subjectId === es.subjectId);
        return {
            subject: es.subject.name,
            code: es.subject.code,
            fullMarks: es.fullMarks,
            passMarks: es.passMarks,
            marksObtained: result?.marksObtained ?? null,
            grade: result?.grade ?? '-',
            gradePoint: result?.gradePoint ?? 0,
            isPassed: (result?.marksObtained || 0) >= es.passMarks
        };
    });

    // 5. Calculate GPA
    const totalPoints = formattedResults.reduce((sum, r) => sum + r.gradePoint, 0);
    const validSubjects = formattedResults.filter(r => r.marksObtained !== null).length;
    const gpa = validSubjects > 0 ? (totalPoints / validSubjects).toFixed(2) : '0.00';

    // Simple Total Grade Logic (Average of points)
    // Real logic might be complex (failure in 1 subject = F), let's do a simple check
    const hasFailed = formattedResults.some(r => r.marksObtained !== null && !r.isPassed);
    const overallGrade = hasFailed ? 'F' : calculateOverallGrade(Number(gpa));

    return {
        examName: exam.name,
        className: exam.class.name,
        results: formattedResults,
        summary: {
            gpa,
            grade: overallGrade,
            totalMarks: formattedResults.reduce((sum, r) => sum + (r.marksObtained || 0), 0),
            totalFullMarks: formattedResults.reduce((sum, r) => sum + r.fullMarks, 0)
        }
    };
}

function calculateOverallGrade(gpa: number) {
    if (gpa >= 5.0) return 'A+';
    if (gpa >= 4.0) return 'A';
    if (gpa >= 3.5) return 'A-';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.0) return 'D';
    return 'F';
}
