import { redirect } from 'next/navigation';
import { FileText, Calendar, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';

export default async function TeacherExamsPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id },
        include: {
            subjectAssignments: {
                include: {
                    subject: {
                        include: {
                            class: {
                                include: {
                                    exams: {
                                        orderBy: { startDate: 'desc' },
                                        take: 10
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!teacher) redirect('/login');

    // Get unique exams from assigned classes
    const examMap = new Map();
    teacher.subjectAssignments.forEach(sa => {
        sa.subject.class.exams.forEach(exam => {
            if (!examMap.has(exam.id)) {
                examMap.set(exam.id, {
                    ...exam,
                    className: sa.subject.class.name
                });
            }
        });
    });

    const exams = Array.from(examMap.values()).sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Exams</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Exams
                </h1>
                <p className="text-slate-500 mt-1">Exams for your classes</p>
            </div>

            {exams.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No exams scheduled.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {exams.map((exam: any) => {
                        const isPast = new Date(exam.endDate || exam.startDate) < new Date();
                        const isOngoing = new Date(exam.startDate) <= new Date() && new Date(exam.endDate || exam.startDate) >= new Date();

                        return (
                            <div key={exam.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {exam.className}
                                            </span>
                                            {isOngoing && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 animate-pulse">
                                                    Ongoing
                                                </span>
                                            )}
                                            {isPast && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{exam.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {format(new Date(exam.startDate), 'MMM d, yyyy')}
                                                {exam.endDate && ` - ${format(new Date(exam.endDate), 'MMM d, yyyy')}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
