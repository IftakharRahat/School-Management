'use client';

import { useState } from 'react';
import { Calendar, Save, Loader2 } from 'lucide-react';
import { updateBulkSchedule } from './actions';

type ExamSubject = {
    id: string;
    examDate: Date | null;
    subject: {
        id: string;
        name: string;
    };
    fullMarks: number;
    passMarks: number;
};

export default function ScheduleEditor({
    examId,
    examName,
    className,
    examSubjects,
}: {
    examId: string;
    examName: string;
    className: string;
    examSubjects: ExamSubject[];
}) {
    const [schedules, setSchedules] = useState<Record<string, string>>(
        examSubjects.reduce((acc, es) => ({
            ...acc,
            [es.id]: es.examDate ? new Date(es.examDate).toISOString().split('T')[0] : '',
        }), {} as Record<string, string>)
    );
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleDateChange = (id: string, date: string) => {
        setSchedules(prev => ({ ...prev, [id]: date }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        const updates = Object.entries(schedules).map(([id, date]) => ({
            id,
            examDate: date || null,
        }));

        const result = await updateBulkSchedule(updates);

        if (result?.error) {
            setMessage(result.error);
        } else {
            setMessage('Schedule saved successfully!');
        }

        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {examName} - {className}
                    </h2>
                    <p className="text-sm text-slate-500">{examSubjects.length} subject(s)</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Schedule
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('error') || message.includes('Failed')
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                    {message}
                </div>
            )}

            {/* Schedule Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Subject</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Full Marks</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Pass Marks</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Exam Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {examSubjects.map((es) => (
                            <tr key={es.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <Calendar className="text-purple-600" size={16} />
                                        </div>
                                        <span className="font-medium text-slate-800">{es.subject.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600">{es.fullMarks}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{es.passMarks}</td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="date"
                                        value={schedules[es.id] || ''}
                                        onChange={(e) => handleDateChange(es.id, e.target.value)}
                                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Schedule Preview</h3>
                <div className="space-y-2">
                    {examSubjects
                        .filter(es => schedules[es.id])
                        .sort((a, b) => new Date(schedules[a.id]).getTime() - new Date(schedules[b.id]).getTime())
                        .map(es => (
                            <div key={es.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="font-medium text-slate-700">{es.subject.name}</span>
                                <span className="text-slate-500">
                                    {new Date(schedules[es.id]).toLocaleDateString('en-BD', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        ))}
                    {!examSubjects.some(es => schedules[es.id]) && (
                        <p className="text-slate-400 text-center py-4">No dates assigned yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
