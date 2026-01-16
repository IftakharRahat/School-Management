import { redirect } from 'next/navigation';
import { Users, Search, GraduationCap } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export default async function TeacherStudentsPage() {
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
                                    sections: {
                                        include: {
                                            enrollments: {
                                                where: { status: 'ACTIVE' },
                                                include: {
                                                    student: {
                                                        include: { user: true }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            classTeacherOf: {
                include: {
                    class: true,
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        include: {
                            student: {
                                include: { user: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!teacher) redirect('/login');

    // Get unique students from classes teacher teaches
    const studentSet = new Map();

    // Students from subject assignments
    teacher.subjectAssignments.forEach(sa => {
        sa.subject.class.sections.forEach(section => {
            section.enrollments.forEach(enrollment => {
                if (!studentSet.has(enrollment.student.id)) {
                    studentSet.set(enrollment.student.id, {
                        ...enrollment.student,
                        class: sa.subject.class.name,
                        section: section.name
                    });
                }
            });
        });
    });

    // Students from class teacher sections
    teacher.classTeacherOf.forEach(section => {
        section.enrollments.forEach(enrollment => {
            if (!studentSet.has(enrollment.student.id)) {
                studentSet.set(enrollment.student.id, {
                    ...enrollment.student,
                    class: section.class.name,
                    section: section.name
                });
            }
        });
    });

    const students = Array.from(studentSet.values());

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">My Students</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-blue-600" />
                    My Students
                </h1>
                <p className="text-slate-500 mt-1">Students in your classes ({students.length} total)</p>
            </div>

            {students.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <GraduationCap className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No students assigned to your classes yet.</p>
                </div>
            ) : (
                <div className="bg-white border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Class</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Section</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Admission No</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {students.map((student: any) => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                                                {student.user.name?.charAt(0) || 'S'}
                                            </div>
                                            <span className="font-medium text-slate-800">{student.user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{student.class}</td>
                                    <td className="px-4 py-3 text-slate-600">{student.section}</td>
                                    <td className="px-4 py-3 text-slate-500">{student.admissionNo}</td>
                                    <td className="px-4 py-3 text-slate-500">{student.user.phone || student.user.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
