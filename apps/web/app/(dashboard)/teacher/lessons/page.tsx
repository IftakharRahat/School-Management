import { redirect } from 'next/navigation';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';

export default async function TeacherLessonsPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) redirect('/login');

    // Get lessons/timetable slots for the teacher
    const slots = await prisma.timetableSlot.findMany({
        where: { teacherId: teacher.id },
        include: {
            subject: true,
            section: {
                include: { class: true }
            }
        },
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
        ]
    });

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayLabels: Record<string, string> = {
        MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
        THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat'
    };

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Lessons</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    My Lessons
                </h1>
                <p className="text-slate-500 mt-1">Your teaching schedule ({slots.length} periods/week)</p>
            </div>

            {slots.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No lessons scheduled yet.</p>
                </div>
            ) : (
                <div className="bg-white border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Day</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Time</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Subject</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-500">Class</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {slots.map(slot => (
                                <tr key={slot.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        {dayLabels[slot.dayOfWeek]}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                                        <Clock size={14} />
                                        {slot.startTime} - {slot.endTime}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        {slot.subject?.name || 'Period'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {slot.section?.class?.name} - {slot.section?.name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
