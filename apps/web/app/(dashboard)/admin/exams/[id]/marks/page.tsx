import { redirect } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getExamDetails, getExamSubjects } from './actions';
import MarksEntry from './marks-entry';

export default async function ExamMarksPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const { id } = await params;
    const exam = await getExamDetails(id);
    if (!exam) return <div>Exam not found</div>;

    const subjects = await getExamSubjects(id);

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <Link href="/admin/exams" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4 text-sm font-medium max-w-fit transition-colors">
                    <ArrowLeft size={16} />
                    Back to Exams
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <BookOpen className="text-blue-600" />
                            {exam.name}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {exam.class.name} • {exam.type.replace('_', ' ')} • {new Date(exam.startDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <MarksEntry exam={exam} subjects={subjects} />
        </div>
    );
}
