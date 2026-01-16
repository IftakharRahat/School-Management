'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { getExamResults, saveExamResults } from './actions';
import { useRouter } from 'next/navigation';

interface MarksEntryProps {
    exam: any;
    subjects: any[];
    initialSubjectId?: string;
}

export default function MarksEntry({ exam, subjects, initialSubjectId }: MarksEntryProps) {
    const router = useRouter();
    const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || subjects[0]?.subjectId || '');
    const [selectedSectionId, setSelectedSectionId] = useState('');

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [marks, setMarks] = useState<Record<string, string>>({}); // Store as string for input handling

    // Fetch data when filters change
    useEffect(() => {
        if (!selectedSubjectId) return;

        async function fetchData() {
            setLoading(true);
            try {
                const data = await getExamResults(exam.id, selectedSubjectId, selectedSectionId);
                setStudents(data);

                // Initialize local state
                const initialMarks: Record<string, string> = {};
                data.forEach((s: any) => {
                    initialMarks[s.studentId] = s.marksObtained !== '' ? String(s.marksObtained) : '';
                });
                setMarks(initialMarks);
            } catch (error) {
                console.error(error);
                alert("Failed to load students");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [exam.id, selectedSubjectId, selectedSectionId]);

    const handleMarkChange = (studentId: string, value: string) => {
        // Allow only numbers and one decimal point
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
            // Cap at full marks (e.g., 100) - Ideally fetch full marks from examSubject
            if (Number(value) > 100) return;
            setMarks(prev => ({ ...prev, [studentId]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert to numbers
            const resultsToSave = Object.entries(marks)
                .filter(([_, val]) => val !== '') // Only save entered marks
                .map(([studentId, val]) => ({
                    studentId,
                    marks: parseFloat(val)
                }));

            const res = await saveExamResults(exam.id, selectedSubjectId, resultsToSave);
            if (res.success) {
                alert("Marks saved successfully!");
                router.refresh();
            } else {
                alert("Failed to save marks");
            }
        } catch (e) {
            alert("Error saving marks");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-48 p-2 border border-slate-200 rounded-lg text-sm"
                    >
                        {subjects.map((s: any) => (
                            <option key={s.subjectId} value={s.subjectId}>{s.subject.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section (Optional)</label>
                    <select
                        value={selectedSectionId}
                        onChange={(e) => setSelectedSectionId(e.target.value)}
                        className="w-40 p-2 border border-slate-200 rounded-lg text-sm"
                    >
                        <option value="">All Sections</option>
                        {exam.class.sections.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Marks Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">
                        Marks Entry
                        {students.length > 0 && <span className="ml-2 text-xs text-slate-500 font-normal">({students.length} students)</span>}
                    </h3>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading || students.length === 0}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                        <p className="text-slate-500">Loading student list...</p>
                    </div>
                ) : students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-b border-slate-200 w-16">Roll</th>
                                    <th className="px-4 py-3 border-b border-slate-200">Student Name</th>
                                    <th className="px-4 py-3 border-b border-slate-200 w-24">Section</th>
                                    <th className="px-4 py-3 border-b border-slate-200 w-32 text-center">Marks (100)</th>
                                    <th className="px-4 py-3 border-b border-slate-200 w-24 text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => {
                                    // Calculate live grade preview
                                    const currentMark = parseFloat(marks[student.studentId] || '0');
                                    const gradePreview = marks[student.studentId] ? (
                                        currentMark >= 80 ? 'A+' :
                                            currentMark >= 70 ? 'A' :
                                                currentMark >= 60 ? 'A-' :
                                                    currentMark >= 50 ? 'B' :
                                                        currentMark >= 40 ? 'C' :
                                                            currentMark >= 33 ? 'D' : 'F'
                                    ) : '-';

                                    // Color the grade
                                    const gradeColor = gradePreview === 'F' ? 'text-red-600 font-bold' :
                                        gradePreview === 'A+' ? 'text-green-600 font-bold' : 'text-slate-600';

                                    return (
                                        <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-600">{student.rollNo}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{student.sectionName}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="text"
                                                    value={marks[student.studentId] || ''}
                                                    onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                                                    className={`w-20 text-center p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${parseFloat(marks[student.studentId]) < 33 ? 'text-red-600 border-red-200 bg-red-50' : 'text-slate-900 border-slate-200'
                                                        }`}
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className={`px-4 py-3 text-center font-medium ${gradeColor}`}>
                                                {gradePreview}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500">No students found for this selection.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
