import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { getHomework } from '../../../admin/homework/actions';
import StudentSubmissionForm from './student-submission-form';

async function getStudentId(userId: string) {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
    });
    return student?.id;
}

export default async function HomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') redirect('/auth/login');

    const { id } = await params;
    const studentId = await getStudentId(session.user.id);
    if (!studentId) return <div>Student profile not found</div>;

    const homework = await getHomework(id);
    if (!homework) notFound();

    // Get student's submission
    const submission = homework.submissions.find(s => s.studentId === studentId);

    const isOverdue = new Date() > new Date(homework.dueDate);
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link
                href="/student/homework"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Homework
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-3">
                                    {homework.subject.name}
                                </span>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{homework.title}</h1>
                                <div className="flex items-center gap-4 text-slate-500 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <User size={16} />
                                        {homework.teacher.user.name}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        Posted {new Date(homework.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-600 mb-8">
                            <p className="whitespace-pre-wrap">{homework.description}</p>
                        </div>

                        {homework.attachmentUrl && (
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg border border-slate-200">
                                    <FileText className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Attachment</p>
                                    <a
                                        href={homework.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Download / View
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grading Feedback */}
                    {submission?.status === 'GRADED' && (
                        <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="text-green-600" />
                                Teacher Feedback
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <p className="text-slate-700">{submission.feedback}</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                                    <p className="text-xs text-green-600 font-medium uppercase">Score</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {submission.points} <span className="text-sm text-green-500">/ {homework.maxPoints}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Submission & Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Submission Status</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-500 text-sm">Due Date</span>
                                <span className={`font-medium text-sm ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                                    {formatDate(homework.dueDate)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-500 text-sm">Max Points</span>
                                <span className="font-medium text-slate-900 text-sm">{homework.maxPoints} pts</span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-slate-500 text-sm">Status</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                    ${submission?.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                                        submission?.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                                            submission?.status === 'LATE' ? 'bg-orange-100 text-orange-700' :
                                                isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}
                                `}>
                                    {submission?.status || (isOverdue ? 'MISSING' : 'PENDING')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <StudentSubmissionForm
                        homeworkId={homework.id}
                        studentId={studentId}
                        initialData={submission}
                        isLate={isOverdue}
                        status={submission?.status || 'PENDING'}
                    />
                </div>
            </div>
        </div>
    );
}
