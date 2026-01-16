import { redirect } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export default async function StudentTimetablePage() {
    const session = await auth();
    if (!session) redirect('/login');

    // Get student's enrollment to find their section
    const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        include: {
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: {
                            class: true,
                            timetableSlots: {
                                include: {
                                    subject: true,
                                    teacher: {
                                        include: { user: true }
                                    }
                                },
                                orderBy: [
                                    { dayOfWeek: 'asc' },
                                    { startTime: 'asc' }
                                ]
                            }
                        }
                    }
                }
            }
        }
    });

    const enrollment = student?.enrollments[0];
    const section = enrollment?.section;
    const slots = section?.timetableSlots || [];

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayLabels: Record<string, string> = {
        MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
        THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat'
    };

    // Group slots by day
    const slotsByDay = days.map(day => ({
        day,
        label: dayLabels[day],
        slots: slots.filter((s: any) => s.dayOfWeek === day)
    }));

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Student</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Timetable</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    My Class Timetable
                </h1>
                {section && (
                    <p className="text-slate-500 mt-1">
                        {section.class.name} - Section {section.name}
                    </p>
                )}
            </div>

            {!section ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-700">You are not enrolled in any class yet.</p>
                </div>
            ) : slots.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No timetable has been set for your class yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slotsByDay.map(({ day, label, slots }) => (
                        <div key={day} className="bg-white border rounded-xl overflow-hidden">
                            <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
                                {label}
                            </div>
                            <div className="divide-y">
                                {slots.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-slate-400 text-sm">
                                        No classes
                                    </div>
                                ) : (
                                    slots.map((slot: any) => (
                                        <div key={slot.id} className="px-4 py-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-slate-800">
                                                    {slot.subject?.name || 'Unknown Subject'}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {slot.teacher?.user?.name || 'TBA'}
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
