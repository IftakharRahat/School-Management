import { redirect } from 'next/navigation';
import { Award } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getStudentExams, getStudentResult } from './actions';
import StudentResultView from './student-result-view';

export default async function StudentResultPage({ searchParams }: { searchParams: Promise<{ examId?: string }> }) {
    const session = await auth();
    if (!session) redirect('/auth/login');
    if (session.user.role !== 'STUDENT') return <div>Access Denied</div>;

    const params = await searchParams;
    const exams = await getStudentExams();
    const defaultExamId = exams.length > 0 ? exams[0].id : '';
    const examId = params.examId || defaultExamId;

    const result = examId ? await getStudentResult(examId) : null;

    return (
        <div className="p-6 max-w-[1000px] mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="text-blue-600" />
                    My Results
                </h1>
                <p className="text-slate-500">View your exam performance and grades</p>
            </div>

            <StudentResultView
                exams={exams}
                initialResult={result}
                initialExamId={examId}
            />
        </div>
    );
}
