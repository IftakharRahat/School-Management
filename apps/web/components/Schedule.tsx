'use client';

import React from 'react';

interface ScheduleItem {
    id: string;
    time: string;
    subject: string;
    class: string;
    day: number;
    duration: number;
    color: string;
}

const SCHEDULE_DATA: ScheduleItem[] = [
    { id: 's1', time: '8:00 AM', subject: 'Physics', class: '4A', day: 0, duration: 1, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 's2', time: '8:00 AM', subject: 'Chemistry', class: '1A', day: 2, duration: 1, color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
    { id: 's3', time: '8:00 AM', subject: 'Chemistry', class: '4A', day: 4, duration: 1, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 's4', time: '9:00 AM', subject: 'Physics', class: '3B', day: 0, duration: 1, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { id: 's5', time: '9:00 AM', subject: 'Physics', class: '2B', day: 1, duration: 1, color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
    { id: 's6', time: '9:00 AM', subject: 'Physics', class: '6A', day: 3, duration: 1, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 's7', time: '9:00 AM', subject: 'Physics', class: '3B', day: 4, duration: 1, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { id: 's8', time: '10:00 AM', subject: 'Physics', class: '2B', day: 0, duration: 1, color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { id: 's9', time: '10:00 AM', subject: 'Physics', class: '3A', day: 1, duration: 1, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { id: 's10', time: '10:00 AM', subject: 'Physics', class: '2B', day: 2, duration: 1, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { id: 's11', time: '10:00 AM', subject: 'Chemistry', class: '6B', day: 3, duration: 1, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
];

const TIME_SLOTS = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function Schedule() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 overflow-x-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Teacher&apos;s Schedule</h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">September 16 – 20</span>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-white rounded-md shadow-sm">Work Week</button>
                        <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">Day</button>
                    </div>
                </div>
            </div>

            <div className="min-w-[600px]">
                {/* Header row for days */}
                <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-0">
                    <div className="h-10"></div>
                    {DAYS.map((day) => (
                        <div key={day} className="h-10 text-center font-medium text-slate-400 text-sm uppercase flex items-center justify-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Time slots rows */}
                {TIME_SLOTS.map((time, timeIdx) => (
                    <div key={time} className="grid grid-cols-[100px_repeat(5,1fr)] border-t border-slate-100">
                        <div className="h-20 text-xs font-medium text-slate-400 p-2 text-right">
                            {time}
                        </div>
                        {DAYS.map((_, dayIdx) => {
                            const item = SCHEDULE_DATA.find(i => i.time === time && i.day === dayIdx);
                            return (
                                <div key={dayIdx} className="h-20 border-l border-slate-100 relative p-1 group">
                                    {item && (
                                        <div className={`absolute inset-1 rounded-lg p-2 border flex flex-col justify-center transition-all cursor-pointer ${item.color}`}>
                                            <span className="text-[10px] font-medium opacity-80">{item.time} – {timeIdx < TIME_SLOTS.length - 1 ? TIME_SLOTS[timeIdx + 1] : '5:00 PM'}</span>
                                            <span className="text-xs font-bold truncate leading-tight">{item.class} - {item.subject}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
