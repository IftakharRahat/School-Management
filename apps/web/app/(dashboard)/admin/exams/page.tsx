import { redirect } from 'next/navigation';
import { BookOpen, Plus, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../homework/actions'; // Reuse existing
import { getClassesForHomework } from '../homework/actions'; // Reuse existing to get classes
import { getExams, deleteExam } from './actions';
import ExamForm from './exam-form';
import { revalidatePath } from 'next/cache';

export default async function ExamPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const exams = await getExams(branchId);
    const classes = await getClassesForHomework(branchId);

    // Quick delete action for the list
    async function deleteAction(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        if (id) await deleteExam(id);
    }

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="text-blue-600" />
                        Examinations
                    </h1>
                    <p className="text-slate-500">Manage exam terms and schedules</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" />
                            New Exam
                        </h2>
                        <ExamForm classes={classes} branchId={branchId} />
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-semibold text-lg text-slate-700">Exam Schedule</h2>
                    {exams.length > 0 ? (
                        exams.map(exam => (
                            <div key={exam.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors flex justify-between items-start group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900">{exam.name}</h3>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded uppercase font-semibold border border-blue-100">
                                            {exam.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 mb-2">
                                        {exam.class?.name} • {exam._count.examSubjects} subjects
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar size={14} />
                                        {new Date(exam.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/exams/${exam.id}/schedule`}
                                        className="text-xs font-semibold bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded transition-colors"
                                    >
                                        Schedule
                                    </Link>
                                    <Link
                                        href={`/admin/exams/${exam.id}/marks`}
                                        className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors"
                                    >
                                        Marks
                                    </Link>
                                    <form action={deleteAction}>
                                        <input type="hidden" name="id" value={exam.id} />
                                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No exams created yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
