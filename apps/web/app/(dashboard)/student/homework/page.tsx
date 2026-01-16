import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, FileText } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { getStudentAssignments } from '../../admin/homework/actions';

async function getStudentId(userId: string) {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
    });
    return student?.id;
}

export default async function StudentHomeworkPage() {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') redirect('/auth/login');

    const studentId = await getStudentId(session.user.id);
    if (!studentId) return <div className="p-6">Student profile not found. Please contact administration.</div>;

    const assignments = await getStudentAssignments(studentId);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        });
    };

    const isOverdue = (date: Date) => {
        return new Date(date) < new Date();
    };

    const getStatusColor = (status: string, dueDate: Date) => {
        if (status === 'SUBMITTED' || status === 'GRADED') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'LATE') return 'bg-orange-100 text-orange-700 border-orange-200';
        if (isOverdue(dueDate)) return 'bg-red-50 text-red-700 border-red-200'; // Missing & Overdue
        return 'bg-blue-50 text-blue-700 border-blue-200'; // Pending
    };

    const getStatusText = (submission: any, dueDate: Date) => {
        if (!submission) {
            return isOverdue(dueDate) ? 'Missing' : 'Pending';
        }
        return submission.status === 'GRADED' ? `Graded: ${submission.points}` : submission.status;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Homework</h1>
                <p className="text-slate-500">View and submit your assignments</p>
            </div>

            {assignments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No Assignments</h3>
                    <p className="text-slate-500">You don't have any pending homework.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments.map((hw) => (
                        <Link
                            key={hw.id}
                            href={`/student/homework/${hw.id}`}
                            className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                            {hw.subject.name}
                                        </span>
                                        {hw.teacher && (
                                            <span className="text-xs text-slate-400">
                                                by {hw.teacher.user.name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{hw.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-1">{hw.description}</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(hw.submission?.status, hw.dueDate)}`}>
                                        {getStatusText(hw.submission, hw.dueDate)}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <Calendar size={14} />
                                        <span>Due {formatDate(hw.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
