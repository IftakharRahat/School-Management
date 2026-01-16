import { redirect } from 'next/navigation';
import { Megaphone, Calendar } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';

export default async function TeacherAnnouncementsPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) redirect('/login');

    // Get published announcements for teacher's branch
    const announcements = await prisma.announcement.findMany({
        where: {
            branchId: teacher.branchId,
            isPublished: true,
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    const priorityColors: Record<string, string> = {
        URGENT: 'border-l-red-500 bg-red-50',
        HIGH: 'border-l-orange-500 bg-orange-50',
        NORMAL: 'border-l-blue-500 bg-blue-50',
        LOW: 'border-l-slate-300 bg-slate-50'
    };

    const typeLabels: Record<string, string> = {
        GENERAL: 'General',
        EXAM: 'Exam',
        EVENT: 'Event',
        HOLIDAY: 'Holiday',
        EMERGENCY: 'Emergency'
    };

    return (
        <div className="p-6 max-w-[900px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Announcements</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Megaphone className="text-blue-600" />
                    Announcements
                </h1>
                <p className="text-slate-500 mt-1">Important notices and updates</p>
            </div>

            {announcements.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <Megaphone className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No announcements at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(announcement => (
                        <div
                            key={announcement.id}
                            className={`border-l-4 rounded-xl p-5 ${priorityColors[announcement.priority] || 'border-l-slate-300 bg-white'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                                    {typeLabels[announcement.type] || announcement.type}
                                </span>
                                {announcement.priority === 'URGENT' && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        Urgent
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">{announcement.title}</h3>
                            <p className="text-slate-600 whitespace-pre-wrap">{announcement.content}</p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
