'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { assignSubjectToTeacher, removeSubjectFromTeacher } from '../../actions';

interface Subject {
    id: string;
    name: string;
    code: string;
    class: {
        id: string;
        name: string;
        grade: number;
    };
}

interface AssignedSubject {
    id: string;
    subjectId: string;
    subject: Subject;
}

interface SubjectAssignmentFormProps {
    teacherId: string;
    assignedSubjects: AssignedSubject[];
    availableSubjects: Subject[];
}

export default function SubjectAssignmentForm({
    teacherId,
    assignedSubjects,
    availableSubjects,
}: SubjectAssignmentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAssign = async () => {
        if (!selectedSubject) return;

        setLoading('assign');
        setError(null);

        try {
            await assignSubjectToTeacher(teacherId, selectedSubject);
            setSelectedSubject('');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to assign subject');
        } finally {
            setLoading(null);
        }
    };

    const handleRemove = async (subjectId: string) => {
        if (!confirm('Are you sure you want to remove this subject assignment?')) return;

        setLoading(subjectId);
        setError(null);

        try {
            await removeSubjectFromTeacher(teacherId, subjectId);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to remove subject');
        } finally {
            setLoading(null);
        }
    };

    // Group available subjects by class
    const groupedAvailable = availableSubjects.reduce((acc, subject) => {
        const className = subject.class.name;
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(subject);
        return acc;
    }, {} as Record<string, Subject[]>);

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Add Subject */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Assign New Subject</h2>

                {availableSubjects.length === 0 ? (
                    <p className="text-slate-500">All subjects have been assigned to this teacher.</p>
                ) : (
                    <div className="flex gap-4">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a subject to assign</option>
                            {Object.entries(groupedAvailable).map(([className, subjects]) => (
                                <optgroup key={className} label={className}>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} ({subject.code})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedSubject || loading === 'assign'}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            Assign
                        </button>
                    </div>
                )}
            </div>

            {/* Assigned Subjects */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Assigned Subjects</h2>
                </div>

                {assignedSubjects.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No subjects assigned</h3>
                        <p className="text-slate-500">Assign subjects to this teacher using the form above</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Subject</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Code</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Class</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedSubjects.map((assignment) => (
                                <tr key={assignment.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-slate-900">
                                                {assignment.subject.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-mono">
                                            {assignment.subject.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {assignment.subject.class.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleRemove(assignment.subjectId)}
                                                disabled={loading === assignment.subjectId}
                                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
