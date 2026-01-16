import { redirect } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export default async function TeacherTimetablePage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id },
        include: {
            timetableSlots: {
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
            }
        }
    });

    if (!teacher) redirect('/login');

    const slots = teacher.timetableSlots;
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayLabels: Record<string, string> = {
        MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
        THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday'
    };

    const dayMap: Record<string, number> = {
        MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 0
    };

    const slotsByDay = days.map(day => ({
        day,
        label: dayLabels[day],
        slots: slots.filter(s => s.dayOfWeek === dayMap[day])
    }));

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Timetable</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    My Teaching Schedule
                </h1>
                <p className="text-slate-500 mt-1">{slots.length} periods per week</p>
            </div>

            {slots.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No timetable assigned yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slotsByDay.map(({ day, label, slots }) => (
                        <div key={day} className="bg-white border rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 font-semibold">
                                {label}
                            </div>
                            <div className="divide-y">
                                {slots.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-slate-400 text-sm">
                                        No classes
                                    </div>
                                ) : (
                                    slots.map((slot) => (
                                        <div key={slot.id} className="px-4 py-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-slate-800">
                                                    {slot.subject?.name || 'Period'}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {slot.section?.class?.name} - {slot.section?.name}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
