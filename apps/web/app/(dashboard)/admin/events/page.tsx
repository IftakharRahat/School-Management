import { redirect } from 'next/navigation';
import { Calendar as CalendarIcon } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getEvents } from './actions';
import EventCalendar from './event-calendar';

export default async function EventsPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const events = await getEvents();

    return (
        <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="mb-6 flex-shrink-0">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Events</span>
                </nav>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <CalendarIcon className="text-blue-600" />
                            Events & Calendar
                        </h1>
                        <p className="text-slate-500 mt-1">Manage school events, holidays, and schedule.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <EventCalendar events={events as any} />
            </div>
        </div>
    );
}
