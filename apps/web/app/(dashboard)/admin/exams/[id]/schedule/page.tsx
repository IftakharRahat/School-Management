import { auth } from '@/lib/auth';
import { getExamSchedule } from './actions';
import ScheduleEditor from './schedule-editor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ExamSchedulePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    const exam = await getExamSchedule(id);

    if (!exam) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Exam not found.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/exams"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
                >
                    <ArrowLeft size={18} />
                    Back to Exams
                </Link>
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Exams</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Schedule</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800">Exam Schedule</h1>
                <p className="text-slate-500 mt-1">Set exam dates for each subject.</p>
            </div>

            <ScheduleEditor
                examId={exam.id}
                examName={exam.name}
                className={exam.class.name}
                examSubjects={exam.examSubjects as any}
            />
        </div>
    );
}
