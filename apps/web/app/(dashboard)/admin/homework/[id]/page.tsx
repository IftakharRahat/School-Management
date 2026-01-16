import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, BookOpen, Clock, Award, Pencil } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getHomework } from '../actions';
import SubmissionsTable from './submissions-table';

export default async function HomeworkViewPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const homework = await getHomework(params.id);
    if (!homework) notFound();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverdue = new Date(homework.dueDate) < new Date();
    const gradedCount = homework.submissions.filter(s => s.status === 'GRADED').length;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/admin/homework"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Homework
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{homework.title}</h1>
                        <p className="text-slate-500">
                            {homework.class.name}
                            {homework.section && ` - Section ${homework.section.name}`}
                            {' · '}{homework.subject.name}
                        </p>
                    </div>
                    <Link
                        href={`/admin/homework/${homework.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Pencil size={16} />
                        Edit
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Stats Cards */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Due Date</p>
                            <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                                {formatDate(homework.dueDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Users size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Submissions</p>
                            <p className="font-semibold text-slate-800">{homework.submissions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Award size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Graded</p>
                            <p className="font-semibold text-slate-800">{gradedCount} / {homework.submissions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Instructions
                </h2>
                <p className="text-slate-600 whitespace-pre-wrap">{homework.description}</p>
                {homework.attachmentUrl && (
                    <a
                        href={homework.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-blue-600 hover:underline"
                    >
                        View Attachment →
                    </a>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Max Points: <span className="font-medium text-slate-700">{homework.maxPoints}</span>
                        {' · '}
                        Assigned by: <span className="font-medium text-slate-700">{homework.teacher.user.name}</span>
                    </p>
                </div>
            </div>

            {/* Submissions */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Student Submissions</h2>
                </div>
                <SubmissionsTable
                    submissions={homework.submissions}
                    maxPoints={homework.maxPoints}
                    homeworkId={homework.id}
                />
            </div>
        </div>
    );
}
