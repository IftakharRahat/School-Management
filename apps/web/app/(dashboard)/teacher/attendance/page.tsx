import { redirect } from 'next/navigation';
import { CheckCircle, Users, Calendar } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import Link from 'next/link';

export default async function TeacherAttendancePage() {
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

    // Get unique sections teacher can take attendance for
    const sectionsSet = new Map();

    // Class teacher sections first (priority)
    teacher.classTeacherOf.forEach(section => {
        sectionsSet.set(section.id, {
            id: section.id,
            name: section.name,
            class: section.class,
            studentCount: section._count.enrollments,
            isClassTeacher: true
        });
    });

    // Subject sections
    teacher.subjectAssignments.forEach(sa => {
        sa.subject.class.sections.forEach(section => {
            if (!sectionsSet.has(section.id)) {
                sectionsSet.set(section.id, {
                    id: section.id,
                    name: section.name,
                    class: sa.subject.class,
                    studentCount: section._count.enrollments,
                    isClassTeacher: false
                });
            }
        });
    });

    const sections = Array.from(sectionsSet.values());

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Attendance</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="text-blue-600" />
                    Take Attendance
                </h1>
                <p className="text-slate-500 mt-1">Mark daily attendance for your classes</p>
            </div>

            {sections.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <Users className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No classes assigned to you yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section: any) => (
                        <div key={section.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        {section.class.name} - {section.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                        <Users size={14} />
                                        {section.studentCount} students
                                    </p>
                                </div>
                                {section.isClassTeacher && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Class Teacher
                                    </span>
                                )}
                            </div>
                            <Link
                                href={`/teacher/attendance/${section.id}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Calendar size={16} />
                                Take Attendance
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
