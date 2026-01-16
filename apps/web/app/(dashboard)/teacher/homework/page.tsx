import { redirect } from 'next/navigation';
import { ClipboardList, Plus, Calendar, Users } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function TeacherHomeworkPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) redirect('/login');

    // Get homework assigned by this teacher
    const homework = await prisma.homework.findMany({
        where: { teacherId: teacher.id },
        include: {
            subject: true,
            class: true,
            section: true,
            _count: { select: { submissions: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 30
    });

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Homework</span>
                </nav>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardList className="text-blue-600" />
                            Homework & Assignments
                        </h1>
                        <p className="text-slate-500 mt-1">Manage your class assignments</p>
                    </div>
                    <Link
                        href="/teacher/homework/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus size={16} /> Create Assignment
                    </Link>
                </div>
            </div>

            {homework.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <ClipboardList className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500 mb-4">No homework created yet.</p>
                    <Link
                        href="/teacher/homework/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        <Plus size={16} /> Create Your First Assignment
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {homework.map(hw => {
                        const isOverdue = new Date(hw.dueDate) < new Date();
                        return (
                            <div key={hw.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {hw.subject.name}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                {hw.class.name} {hw.section ? `- ${hw.section.name}` : ''}
                                            </span>
                                            {isOverdue && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Past Due
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{hw.title}</h3>
                                        {hw.description && (
                                            <p className="text-slate-500 text-sm mb-3 line-clamp-2">{hw.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                Due: {format(new Date(hw.dueDate), 'MMM d, yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {hw._count.submissions} submissions
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/teacher/homework/${hw.id}`}
                                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
