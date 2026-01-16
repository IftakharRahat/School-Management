import { redirect } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export default async function TeacherSubjectsPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id },
        include: {
            subjectAssignments: {
                include: {
                    subject: {
                        include: {
                            class: true
                        }
                    }
                }
            }
        }
    });

    if (!teacher) redirect('/login');

    const subjects = teacher.subjectAssignments.map(sa => ({
        id: sa.subject.id,
        name: sa.subject.name,
        code: sa.subject.code,
        className: sa.subject.class.name
    }));

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">My Subjects</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    My Subjects
                </h1>
                <p className="text-slate-500 mt-1">Subjects assigned to you</p>
            </div>

            {subjects.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No subjects assigned yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map(subject => (
                        <div key={subject.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {subject.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">{subject.name}</h3>
                                    <p className="text-sm text-slate-500">{subject.code}</p>
                                </div>
                            </div>
                            <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                Class: {subject.className}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
