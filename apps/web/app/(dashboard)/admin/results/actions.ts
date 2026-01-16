'use server';

import { prisma } from '@repo/database';
import { getExamDetails } from '../exams/[id]/marks/actions'; // Reuse

export async function getExamsForResults(branchId: string) {
    return prisma.exam.findMany({
        where: { class: { branchId } },
        include: { class: true },
        orderBy: { startDate: 'desc' }
    });
}

export async function getClassResultSummary(examId: string, sectionId?: string) {
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
            examSubjects: true,
            class: true
        }
    });

    if (!exam) return [];

    // Get students
    const students = await prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    ...(sectionId ? { sectionId } : { section: { classId: exam.classId } }),
                    status: 'ACTIVE'
                }
            }
        },
        include: {
            user: true,
            enrollments: {
                where: { section: { classId: exam.classId }, status: 'ACTIVE' },
                include: { section: true }
            }
        },
        orderBy: { enrollments: { _count: 'desc' } }
    });

    // Get all results for this exam
    const results = await prisma.result.findMany({
        where: {
            examId,
            studentId: { in: students.map(s => s.id) }
        }
    });

    // Calculate Summary for each student
    return students.map(student => {
        const studentResults = results.filter(r => r.studentId === student.id);

        // Calculate GPA
        const totalPoints = studentResults.reduce((sum, r) => sum + (r.gradePoint || 0), 0);
        const subjectCount = exam.examSubjects.length; // Or studentResults.length? Ideally total subjects.
        // Assuming student takes all subjects. If not, we should filter.

        let gpa = 0;
        let grade = 'F';

        // Simple logic: if any failed, Fail. Else Avg.
        // We need to know pass marks.
        // Let's assume we fetch full Result details to know pass/fail status per subject?
        // For distinct summary list, let's keep it simple:

        // Check if failed in any subject (grade F or marks < passMarks)
        // We don't have passMarks here easily joined without more logic.
        // Use Grade 'F' check if stored.
        const hasFailed = studentResults.some(r => r.grade === 'F');

        if (studentResults.length > 0) {
            if (hasFailed) {
                gpa = 0.00;
                grade = 'F';
            } else {
                // Only count subjects they have results for? Or divide by total exam subjects?
                // Usually divide by total registered subjects.
                gpa = subjectCount > 0 ? (totalPoints / subjectCount) : 0;
                grade = calculateOverallGrade(gpa);
            }
        } else {
            grade = '-';
        }

        const totalMarks = studentResults.reduce((sum, r) => sum + r.marksObtained, 0);

        return {
            studentId: student.id,
            name: student.user.name,
            rollNo: student.enrollments[0]?.rollNumber || '-',
            section: student.enrollments[0]?.section.name || '-',
            totalMarks,
            gpa: gpa.toFixed(2),
            grade,
            subjectCount: studentResults.length,
            totalSubjects: subjectCount
        };
    }).sort((a, b) => {
        // Sort by Grade (A+ first) then GPA then Total Marks
        // Or just Roll No? Usually Merit List.
        // Let's sort by Roll No for the "Result Sheet" view
        return a.rollNo.localeCompare(b.rollNo);
    });
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

// Reusing the logic for detailed card
export async function getStudentResultCard(examId: string, studentId: string) {
    // 1. Get Exam Details
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { class: true }
    });

    if (!exam) return null;

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: true,
            enrollments: {
                where: { section: { classId: exam.classId } },
                include: { section: true }
            }
        }
    });

    if (!student) return null;

    // 2. Get All Subjects
    const examSubjects = await prisma.examSubject.findMany({
        where: { examId },
        include: { subject: true }
    });

    // 3. Get Results
    const results = await prisma.result.findMany({
        where: {
            examId,
            studentId
        }
    });

    // 4. Merge
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
    const validSubjects = formattedResults.length; // Divide by total subjects in exam
    const hasFailed = formattedResults.some(r => r.marksObtained !== null && !r.isPassed);

    // Treat missing marks as incomplete or ignore?
    // If student missed an exam, is it F? usually yes.
    // For now, let's only calc GPA based on what is present or if fail.

    let overallGrade = 'F';
    let gpa = 0;

    if (!hasFailed) {
        gpa = validSubjects > 0 ? (totalPoints / validSubjects) : 0;
        overallGrade = calculateOverallGrade(gpa);
    }

    return {
        examName: exam.name,
        className: exam.class.name,
        sectionName: student.enrollments[0]?.section.name || '',
        studentName: student.user.name,
        rollNo: student.enrollments[0]?.rollNumber || '-',
        results: formattedResults,
        summary: {
            gpa: gpa.toFixed(2),
            grade: overallGrade,
            totalMarks: formattedResults.reduce((sum, r) => sum + (r.marksObtained || 0), 0),
            totalFullMarks: formattedResults.reduce((sum, r) => sum + r.fullMarks, 0)
        }
    };
}
