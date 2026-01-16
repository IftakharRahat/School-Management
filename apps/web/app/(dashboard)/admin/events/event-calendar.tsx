'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, MapPin, Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { createEvent, deleteEvent } from './actions';

type Event = {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    eventType: string;
    color: string | null;
    allDay: boolean;
    location: string | null;
};

export default function EventCalendar({ events }: { events: Event[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calendar Generation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Padding days
    const startDay = monthStart.getDay();
    const paddingDays = Array.from({ length: startDay });

    const [form, setForm] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '10:00',
        eventType: 'GENERAL',
        location: '',
        allDay: false
    });

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setForm(prev => ({
            ...prev,
            startDate: format(date, 'yyyy-MM-dd')
        }));
        setShowAdd(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const startDateTime = form.allDay
            ? new Date(form.startDate)
            : new Date(`${form.startDate}T${form.startTime}`);

        const endDateTime = form.endDate
            ? (form.allDay ? new Date(form.endDate) : new Date(`${form.endDate}T${form.endTime}`))
            : null;

        await createEvent({
            title: form.title,
            description: form.description,
            eventType: form.eventType,
            location: form.location,
            startDate: startDateTime,
            endDate: endDateTime,
            allDay: form.allDay,
            color: getColorByType(form.eventType)
        });

        setShowAdd(false);
        setForm({ title: '', description: '', startDate: '', endDate: '', startTime: '09:00', endTime: '10:00', eventType: 'GENERAL', location: '', allDay: false });
        setIsSubmitting(false);
    };

    const getColorByType = (type: string) => {
        switch (type) {
            case 'HOLIDAY': return '#ef4444'; // Red
            case 'EXAM': return '#f59e0b'; // Amber
            case 'MEETING': return '#8b5cf6'; // Violet
            case 'SPORTS': return '#10b981'; // Emerald
            default: return '#3b82f6'; // Blue
        }
    };

    const EventsList = ({ date }: { date: Date }) => {
        const dayEvents = events.filter(e => isSameDay(new Date(e.startDate), date));
        if (dayEvents.length === 0) return null;

        return (
            <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className="text-[10px] truncate px-1 rounded text-white" style={{ backgroundColor: e.color || '#3b82f6' }}>
                        {e.title}
                    </div>
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 3} more</div>}
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Calendar Grid */}
            <div className="flex-1 bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg hover:bg-slate-200">Today</button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-slate-500">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1 auto-rows-[100px]">
                    {paddingDays.map((_, i) => <div key={`pad-${i}`} className="bg-slate-50/50 rounded-lg" />)}

                    {daysInMonth.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDateClick(day)}
                                className={`relative p-2 rounded-lg border cursor-pointer hover:border-blue-300 transition-colors
                                    ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}
                                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                `}
                            >
                                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                    {format(day, 'd')}
                                </span>
                                <EventsList date={day} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar / Form */}
            <div className="w-full lg:w-80 bg-white rounded-xl border p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Events</h3>
                    <button onClick={() => setShowAdd(true)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                        <Plus size={18} />
                    </button>
                </div>

                {showAdd ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium">New Event</span>
                            <button onClick={() => setShowAdd(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500">Title</label>
                                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Start Date</label>
                                    <input required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                                </div>
                                {!form.allDay && (
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">Time</label>
                                        <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="allDay" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} />
                                <label htmlFor="allDay" className="text-sm cursor-pointer select-none">All Day Event</label>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Type</label>
                                <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                                    <option value="GENERAL">General</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="EXAM">Exam</option>
                                    <option value="MEETING">Meeting</option>
                                    <option value="SPORTS">Sports</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Location</label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded text-sm mt-2">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Create Event'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {events.filter(e => selectedDate ? isSameDay(new Date(e.startDate), selectedDate) : true)
                            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                            .map(event => (
                                <div key={event.id} className="p-3 bg-slate-50 rounded-lg border-l-4" style={{ borderLeftColor: event.color || '#3b82f6' }}>
                                    <div className="font-medium text-slate-800 text-sm">{event.title}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <CalendarIcon size={12} />
                                        {format(new Date(event.startDate), 'MMM d, p')}
                                    </div>
                                    {event.location && (
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <MapPin size={12} /> {event.location}
                                        </div>
                                    )}
                                </div>
                            ))}
                        {events.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No events found</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
