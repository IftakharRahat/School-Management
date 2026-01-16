'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { upsertTimetableSlot, deleteTimetableSlot } from './actions';

interface Teacher {
    id: string;
    user: { name: string };
}

interface Subject {
    id: string;
    name: string;
    classId: string;
}

interface Slot {
    id: string;
    sectionId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    subject: { name: string };
    teacher: { user: { name: string } };
}

interface TimetableGridProps {
    classId: string;
    sectionId: string;
    slots: Slot[];
    teachers: Teacher[];
    subjects: Subject[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:30' },
    { start: '09:30', end: '10:15' },
    { start: '10:15', end: '11:00' }, // Break?
    { start: '11:30', end: '12:15' },
    { start: '12:15', end: '13:00' },
    { start: '13:00', end: '13:45' },
    { start: '13:45', end: '14:30' },
];

export default function TimetableGrid({ classId, sectionId, slots, teachers, subjects }: TimetableGridProps) {
    const router = useRouter();
    const [editingCell, setEditingCell] = useState<{ day: number, start: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');

    // Filter subjects for current class
    const classSubjects = subjects.filter(s => s.classId === classId);

    const getSlot = (dayIdx: number, start: string) => {
        return slots.find(s => s.dayOfWeek === dayIdx && s.startTime === start);
    };

    const handleEdit = (day: number, start: string, currentSlot?: Slot) => {
        setEditingCell({ day, start });
        if (currentSlot) {
            setSelectedSubject(currentSlot.subjectId);
            setSelectedTeacher(currentSlot.teacherId);
        } else {
            setSelectedSubject('');
            setSelectedTeacher('');
        }
    };

    const handleSave = async (endTime: string) => {
        if (!editingCell || !selectedSubject || !selectedTeacher) return;
        setLoading(true);

        try {
            const currentSlot = getSlot(editingCell.day, editingCell.start);

            await upsertTimetableSlot({
                sectionId,
                subjectId: selectedSubject,
                teacherId: selectedTeacher,
                dayOfWeek: editingCell.day,
                startTime: editingCell.start,
                endTime,
                slotId: currentSlot?.id
            });

            setEditingCell(null);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slotId: string) => {
        if (!confirm('Are you sure you want to remove this class?')) return;
        setLoading(true);
        try {
            await deleteTimetableSlot(slotId);
            setEditingCell(null);
            router.refresh();
        } catch (error) {
            alert('Failed to delete slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                            Day / Time
                        </th>
                        {TIME_SLOTS.map((time, i) => (
                            <th key={i} className="px-4 py-3 text-center border-r border-slate-200 min-w-[160px]">
                                {time.start} - {time.end}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {DAYS.map((day, dayIdx) => (
                        <tr key={day} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900 bg-white sticky left-0 border-r border-slate-200 z-10">
                                {day}
                            </td>
                            {TIME_SLOTS.map((time, timeIdx) => {
                                const slot = getSlot(dayIdx, time.start);
                                const isEditing = editingCell?.day === dayIdx && editingCell?.start === time.start;

                                return (
                                    <td key={timeIdx} className="p-2 border-r border-slate-200 relative min-h-[100px]">
                                        {isEditing ? (
                                            <div className="bg-white p-2 rounded shadow-lg border border-blue-200 absolute inset-0 z-20 flex flex-col gap-2">
                                                <select
                                                    value={selectedSubject}
                                                    onChange={e => setSelectedSubject(e.target.value)}
                                                    className="w-full text-xs p-1 border rounded"
                                                    autoFocus
                                                >
                                                    <option value="">Subject...</option>
                                                    {classSubjects.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={selectedTeacher}
                                                    onChange={e => setSelectedTeacher(e.target.value)}
                                                    className="w-full text-xs p-1 border rounded"
                                                >
                                                    <option value="">Teacher...</option>
                                                    {teachers.map(t => (
                                                        <option key={t.id} value={t.id}>{t.user.name}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-1 justify-end">
                                                    <button
                                                        onClick={() => handleSave(time.end)}
                                                        disabled={loading || !selectedSubject || !selectedTeacher}
                                                        className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                                    >
                                                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                    </button>

                                                    {slot ? (
                                                        <button
                                                            onClick={() => handleDelete(slot.id)}
                                                            disabled={loading}
                                                            className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                            title="Delete"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingCell(null)}
                                                            className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : slot ? (
                                            <div
                                                onClick={() => handleEdit(dayIdx, time.start, slot)}
                                                className="bg-blue-50 hover:bg-blue-100 p-2 rounded cursor-pointer h-full min-h-[60px] flex flex-col justify-center transition-colors"
                                            >
                                                <p className="font-semibold text-blue-900 text-xs truncate">{slot.subject.name}</p>
                                                <p className="text-blue-700 text-[10px] truncate">{slot.teacher.user.name}</p>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => handleEdit(dayIdx, time.start)}
                                                className="h-full min-h-[60px] flex items-center justify-center text-slate-300 hover:bg-slate-50 cursor-pointer rounded transition-colors group"
                                            >
                                                <span className="opacity-0 group-hover:opacity-100 text-xs">+ Add</span>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
