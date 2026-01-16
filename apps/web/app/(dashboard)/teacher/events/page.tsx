import { redirect } from 'next/navigation';
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';

export default async function TeacherEventsPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) redirect('/login');

    // Get upcoming events for teacher's branch
    const events = await prisma.event.findMany({
        where: {
            branchId: teacher.branchId,
            startDate: { gte: new Date() }
        },
        orderBy: { startDate: 'asc' },
        take: 20,
        include: {
            _count: { select: { registrations: true } }
        }
    });

    const eventTypeColors: Record<string, string> = {
        GENERAL: 'bg-slate-100 text-slate-700',
        HOLIDAY: 'bg-red-100 text-red-700',
        EXAM: 'bg-orange-100 text-orange-700',
        MEETING: 'bg-blue-100 text-blue-700',
        SPORTS: 'bg-green-100 text-green-700',
        CULTURAL: 'bg-purple-100 text-purple-700',
        PARENT_MEETING: 'bg-indigo-100 text-indigo-700',
        ASSEMBLY: 'bg-teal-100 text-teal-700'
    };

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Events</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDays className="text-blue-600" />
                    School Events
                </h1>
                <p className="text-slate-500 mt-1">Upcoming events and activities</p>
            </div>

            {events.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-8 text-center">
                    <CalendarDays className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">No upcoming events scheduled.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {events.map(event => (
                        <div key={event.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${eventTypeColors[event.eventType] || 'bg-slate-100 text-slate-700'}`}>
                                            {event.eventType}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{event.title}</h3>
                                    {event.description && (
                                        <p className="text-slate-500 text-sm mb-3 line-clamp-2">{event.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {format(new Date(event.startDate), 'MMM d, yyyy')}
                                        </span>
                                        {event.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {event.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {event._count.registrations} registered
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center bg-blue-50 rounded-lg px-4 py-2 min-w-[70px]">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {format(new Date(event.startDate), 'd')}
                                    </div>
                                    <div className="text-xs text-blue-500 uppercase">
                                        {format(new Date(event.startDate), 'MMM')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
