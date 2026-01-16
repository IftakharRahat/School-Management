import { redirect } from 'next/navigation';
import { FileText, Users, Calendar, BookOpen } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import Link from 'next/link';

export default async function TeacherResultsPage() {
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
                                    sections: true,
                                    exams: {
                                        orderBy: { startDate: 'desc' },
                                        take: 5
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

    // Get unique class-subject combinations
    const teachingData = teacher.subjectAssignments.map(sa => ({
        subjectId: sa.subject.id,
        subjectName: sa.subject.name,
        className: sa.subject.class.name,
        classId: sa.subject.class.id,
        sections: sa.subject.class.sections,
        recentExams: sa.subject.class.exams
    }));

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Results</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Enter Results
                </h1>
                <p className="text-slate-500 mt-1">Enter marks for your subjects</p>
            </div>

            {teachingData.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No subjects assigned to you yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {teachingData.map((data, idx) => (
                        <div key={idx} className="bg-white border rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <BookOpen className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">{data.subjectName}</h3>
                                    <p className="text-sm text-slate-500">{data.className}</p>
                                </div>
                            </div>

                            {data.recentExams.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-400 uppercase">Recent Exams</p>
                                    {data.recentExams.slice(0, 3).map(exam => (
                                        <Link
                                            key={exam.id}
                                            href={`/teacher/results/${exam.id}/${data.subjectId}`}
                                            className="block px-3 py-2 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-slate-700">{exam.name}</span>
                                                <span className="text-xs text-blue-600">Enter Marks →</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-3">No exams scheduled</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
