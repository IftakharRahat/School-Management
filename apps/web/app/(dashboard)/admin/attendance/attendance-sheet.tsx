'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { getAttendanceSheet, saveAttendance, AttendanceRecord } from './actions';

interface AttendanceSheetProps {
    classId: string;
    sectionId: string;
    date: Date; // Passed from server as object
}

export default function AttendanceSheet({ classId, sectionId, date }: AttendanceSheetProps) {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

    useEffect(() => {
        // Fetch data when props change
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getAttendanceSheet(sectionId, date);
                setRecords(data);
            } catch (error) {
                console.error("Failed to load attendance", error);
            } finally {
                setLoading(false);
            }
        };

        if (sectionId) loadData();
    }, [sectionId, date]);

    useEffect(() => {
        // Calculate stats
        const total = records.length;
        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const late = records.filter(r => r.status === 'LATE').length;
        setStats({ present, absent, late, total });
    }, [records]);

    const handleStatusChange = (studentId: string, status: any) => {
        setRecords(prev => prev.map(r =>
            r.studentId === studentId ? { ...r, status } : r
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveAttendance(sectionId, date, records.map(r => ({
                studentId: r.studentId,
                status: r.status,
                remarks: r.remarks
            })));
            alert('Attendance saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const markAll = (status: 'PRESENT' | 'ABSENT') => {
        setRecords(prev => prev.map(r => ({ ...r, status })));
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2" /> Loading record...</div>;
    }

    if (records.length === 0) {
        return <div className="p-8 text-center text-slate-500 border rounded-lg bg-slate-50 mt-4">No active students found in this class.</div>;
    }

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm text-sm">
                <div className="flex-1">
                    <span className="text-slate-500">Total Students:</span>
                    <span className="ml-2 font-bold">{stats.total}</span>
                </div>
                <div className="flex-1 text-green-600">
                    <span className="text-slate-500">Present:</span>
                    <span className="ml-2 font-bold">{stats.present}</span>
                </div>
                <div className="flex-1 text-red-600">
                    <span className="text-slate-500">Absent:</span>
                    <span className="ml-2 font-bold">{stats.absent}</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-end gap-2 text-xs">
                <button
                    onClick={() => markAll('PRESENT')}
                    className="text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200"
                >
                    Mark All Present
                </button>
                <button
                    onClick={() => markAll('ABSENT')}
                    className="text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                >
                    Mark All Absent
                </button>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Roll No</th>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {records.map((student) => (
                            <tr key={student.studentId} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-500">{student.rollNo || '-'}</td>
                                <td className="px-4 py-3 font-medium text-slate-900">{student.studentName}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${student.status === 'PRESENT'
                                                    ? 'bg-green-100 text-green-700 ring-1 ring-green-600'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-green-50'
                                                }`}
                                        >
                                            P
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.studentId, 'LATE')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${student.status === 'LATE'
                                                    ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-600'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-yellow-50'
                                                }`}
                                        >
                                            L
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${student.status === 'ABSENT'
                                                    ? 'bg-red-100 text-red-700 ring-1 ring-red-600'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-red-50'
                                                }`}
                                        >
                                            A
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.studentId, 'EXCUSED')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${student.status === 'EXCUSED'
                                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-600'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-blue-50'
                                                }`}
                                        >
                                            E
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        placeholder="Note..."
                                        value={student.remarks || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setRecords(prev => prev.map(r =>
                                                r.studentId === student.studentId ? { ...r, remarks: val } : r
                                            ))
                                        }}
                                        className="w-full text-xs border-b border-transparent focus:border-blue-500 bg-transparent focus:outline-none"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Floating Save Button */}
            <div className="sticky bottom-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-70 transition-all font-semibold"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Attendance
                </button>
            </div>
        </div>
    );
}
