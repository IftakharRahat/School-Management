'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Student {
    id: string;
    name: string;
    admissionNo: string;
    rollNumber: string | null;
}

export default function TakeAttendancePage() {
    const router = useRouter();
    const params = useParams();
    const sectionId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sectionInfo, setSectionInfo] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        loadData();
    }, [sectionId]);

    async function loadData() {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/attendance/${sectionId}`);
            if (res.ok) {
                const data = await res.json();
                setSectionInfo(data.section);
                setStudents(data.students || []);
                // Initialize all as PRESENT
                const initialAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
                data.students?.forEach((s: Student) => {
                    initialAttendance[s.id] = 'PRESENT';
                });
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error('Failed to load', error);
        } finally {
            setLoading(false);
        }
    }

    function toggleStatus(studentId: string) {
        setAttendance(prev => {
            const current = prev[studentId];
            const next = current === 'PRESENT' ? 'ABSENT' : current === 'ABSENT' ? 'LATE' : 'PRESENT';
            return { ...prev, [studentId]: next };
        });
    }

    async function handleSubmit() {
        setSaving(true);
        try {
            const res = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionId,
                    date,
                    attendance: Object.entries(attendance).map(([studentId, status]) => ({
                        studentId,
                        status
                    }))
                })
            });

            if (res.ok) {
                alert('Attendance saved successfully!');
                router.push('/teacher/attendance');
            } else {
                alert('Failed to save attendance');
            }
        } catch (error) {
            alert('Error saving attendance');
        } finally {
            setSaving(false);
        }
    }

    const statusColors = {
        PRESENT: 'bg-green-100 text-green-700 border-green-200',
        ABSENT: 'bg-red-100 text-red-700 border-red-200',
        LATE: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };

    const statusIcons = {
        PRESENT: <CheckCircle size={18} />,
        ABSENT: <XCircle size={18} />,
        LATE: <Clock size={18} />
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-slate-500">
                Loading students...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1000px] mx-auto">
            <div className="mb-6">
                <Link href="/teacher/attendance" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
                    <ArrowLeft size={16} /> Back to Attendance
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="text-blue-600" />
                            Take Attendance
                        </h1>
                        {sectionInfo && (
                            <p className="text-slate-500 mt-1">
                                {sectionInfo.class?.name} - Section {sectionInfo.name}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden mb-6">
                <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Users size={16} />
                        {students.length} Students
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} /> Present: {Object.values(attendance).filter(s => s === 'PRESENT').length}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                            <XCircle size={14} /> Absent: {Object.values(attendance).filter(s => s === 'ABSENT').length}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-600">
                            <Clock size={14} /> Late: {Object.values(attendance).filter(s => s === 'LATE').length}
                        </span>
                    </div>
                </div>

                <div className="divide-y">
                    {students.map((student, idx) => (
                        <div key={student.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-slate-800">{student.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {student.rollNumber || student.admissionNo}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleStatus(student.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${statusColors[attendance[student.id]]}`}
                            >
                                {statusIcons[attendance[student.id]]}
                                {attendance[student.id]}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={saving || students.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
}
