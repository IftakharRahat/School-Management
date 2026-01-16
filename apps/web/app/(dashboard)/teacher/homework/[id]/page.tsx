import { redirect, notFound } from 'next/navigation';
import { ClipboardList, Calendar, Users, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';
import Link from 'next/link';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function HomeworkDetailPage({ params }: Props) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) redirect('/login');

    const homework = await prisma.homework.findUnique({
        where: { id },
        include: {
            subject: true,
            class: true,
            section: true,
            submissions: {
                include: {
                    student: {
                        include: { user: true }
                    }
                },
                orderBy: { submittedAt: 'desc' }
            }
        }
    });

    if (!homework || homework.teacherId !== teacher.id) {
        notFound();
    }

    const isOverdue = new Date(homework.dueDate) < new Date();

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <Link href="/teacher/homework" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
                    <ArrowLeft size={16} /> Back to Homework
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {homework.subject.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                {homework.class.name} {homework.section ? `- ${homework.section.name}` : ''}
                            </span>
                            {isOverdue && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Past Due
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">{homework.title}</h1>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white border rounded-xl p-6">
                        <h2 className="font-semibold text-slate-800 mb-3">Description</h2>
                        <p className="text-slate-600 whitespace-pre-wrap">
                            {homework.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Submissions */}
                    <div className="bg-white border rounded-xl p-6">
                        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Users size={18} />
                            Submissions ({homework.submissions.length})
                        </h2>

                        {homework.submissions.length === 0 ? (
                            <p className="text-slate-500 text-center py-6">No submissions yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {homework.submissions.map(sub => (
                                    <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                                {sub.student.user.name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{sub.student.user.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {format(new Date(sub.submittedAt), 'MMM d, yyyy h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {sub.grade !== null ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    Grade: {sub.grade}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                    Not Graded
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-4">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Due Date</span>
                                <span className="font-medium text-slate-700 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {format(new Date(homework.dueDate), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Created</span>
                                <span className="text-slate-700">
                                    {format(new Date(homework.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Submissions</span>
                                <span className="text-slate-700">{homework.submissions.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <h3 className="font-semibold text-blue-800 mb-2">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-green-600">
                                    {homework.submissions.filter(s => s.grade !== null).length}
                                </div>
                                <div className="text-xs text-slate-500">Graded</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {homework.submissions.filter(s => s.grade === null).length}
                                </div>
                                <div className="text-xs text-slate-500">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
