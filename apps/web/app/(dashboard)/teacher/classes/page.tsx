import { redirect } from 'next/navigation';
import { GraduationCap, Users } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export default async function TeacherClassesPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id },
        include: {
            classTeacherOf: {
                include: {
                    class: true,
                    _count: { select: { enrollments: true } }
                }
            },
            subjectAssignments: {
                include: {
                    subject: {
                        include: {
                            class: {
                                include: {
                                    sections: {
                                        include: {
                                            _count: { select: { enrollments: true } }
                                        }
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

    // Get unique classes
    const classMap = new Map();

    teacher.classTeacherOf.forEach(section => {
        if (!classMap.has(section.class.id)) {
            classMap.set(section.class.id, {
                id: section.class.id,
                name: section.class.name,
                isClassTeacher: true,
                sections: [{ name: section.name, students: section._count.enrollments }]
            });
        }
    });

    teacher.subjectAssignments.forEach(sa => {
        const cls = sa.subject.class;
        if (!classMap.has(cls.id)) {
            classMap.set(cls.id, {
                id: cls.id,
                name: cls.name,
                isClassTeacher: false,
                sections: cls.sections.map(s => ({ name: s.name, students: s._count.enrollments }))
            });
        }
    });

    const classes = Array.from(classMap.values());

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">My Classes</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" />
                    My Classes
                </h1>
                <p className="text-slate-500 mt-1">Classes you teach</p>
            </div>

            {classes.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <GraduationCap className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No classes assigned yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls: any) => (
                        <div key={cls.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-slate-800">{cls.name}</h3>
                                {cls.isClassTeacher && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Class Teacher
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {cls.sections.map((section: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg">
                                        <span className="text-slate-600">Section {section.name}</span>
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <Users size={14} />
                                            {section.students}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
