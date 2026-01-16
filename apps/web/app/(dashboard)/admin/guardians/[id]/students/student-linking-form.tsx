'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, UserCheck, Star, StarOff } from 'lucide-react';
import { linkStudentToGuardian, unlinkStudentFromGuardian, updateStudentGuardianLink } from '../../actions';

const RELATIONS = [
    'FATHER', 'MOTHER', 'BROTHER', 'SISTER',
    'UNCLE', 'AUNT', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER'
] as const;

interface Student {
    id: string;
    admissionNo: string;
    user: { name: string };
    enrollments?: {
        section: {
            name: string;
            class: { name: string };
        };
    }[];
}

interface LinkedStudent {
    id: string;
    studentId: string;
    relation: string;
    isPrimary: boolean;
    student: Student;
}

interface StudentLinkingFormProps {
    guardianId: string;
    linkedStudents: LinkedStudent[];
    availableStudents: Student[];
}

export default function StudentLinkingForm({
    guardianId,
    linkedStudents,
    availableStudents,
}: StudentLinkingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRelation, setSelectedRelation] = useState<typeof RELATIONS[number]>('FATHER');
    const [isPrimary, setIsPrimary] = useState(false);

    const handleLink = async () => {
        if (!selectedStudent) return;

        setLoading('link');
        setError(null);

        try {
            await linkStudentToGuardian(guardianId, selectedStudent, selectedRelation, isPrimary);
            setSelectedStudent('');
            setIsPrimary(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to link student');
        } finally {
            setLoading(null);
        }
    };

    const handleUnlink = async (studentId: string) => {
        if (!confirm('Are you sure you want to unlink this student?')) return;

        setLoading(studentId);
        setError(null);

        try {
            await unlinkStudentFromGuardian(guardianId, studentId);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to unlink student');
        } finally {
            setLoading(null);
        }
    };

    const handleSetPrimary = async (studentId: string, currentlyPrimary: boolean) => {
        if (currentlyPrimary) return; // Already primary

        setLoading(`primary-${studentId}`);
        setError(null);

        try {
            await updateStudentGuardianLink(guardianId, studentId, { isPrimary: true });
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to update');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Link New Student */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Link New Student</h2>

                {availableStudents.length === 0 ? (
                    <p className="text-slate-500">All students are already linked to this guardian.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Student</label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a student</option>
                                {availableStudents.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.user.name} ({student.admissionNo})
                                        {student.enrollments?.[0] &&
                                            ` - ${student.enrollments[0].section.class.name} ${student.enrollments[0].section.name}`
                                        }
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Relation</label>
                            <select
                                value={selectedRelation}
                                onChange={(e) => setSelectedRelation(e.target.value as typeof RELATIONS[number])}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {RELATIONS.map((rel) => (
                                    <option key={rel} value={rel}>
                                        {rel.charAt(0) + rel.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-3">
                            <label className="flex items-center gap-2 pb-2.5">
                                <input
                                    type="checkbox"
                                    checked={isPrimary}
                                    onChange={(e) => setIsPrimary(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                                />
                                <span className="text-sm text-slate-700">Primary</span>
                            </label>
                            <button
                                onClick={handleLink}
                                disabled={!selectedStudent || loading === 'link'}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                                Link
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Linked Students */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Linked Students</h2>
                </div>

                {linkedStudents.length === 0 ? (
                    <div className="text-center py-12">
                        <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No students linked</h3>
                        <p className="text-slate-500">Link students to this guardian using the form above</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Student</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Class</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Relation</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Primary</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {linkedStudents.map((link) => (
                                <tr key={link.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/students/${link.studentId}`}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {link.student.user.name}
                                        </Link>
                                        <p className="text-sm text-slate-500">{link.student.admissionNo}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {link.student.enrollments?.[0] ? (
                                            `${link.student.enrollments[0].section.class.name} - ${link.student.enrollments[0].section.name}`
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm capitalize">
                                            {link.relation.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleSetPrimary(link.studentId, link.isPrimary)}
                                            disabled={link.isPrimary || loading === `primary-${link.studentId}`}
                                            className={`p-2 rounded-lg transition-colors ${link.isPrimary
                                                    ? 'text-amber-500 cursor-default'
                                                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                                                }`}
                                            title={link.isPrimary ? 'Primary Guardian' : 'Set as Primary'}
                                        >
                                            {link.isPrimary ? (
                                                <Star className="w-5 h-5 fill-current" />
                                            ) : (
                                                <StarOff className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleUnlink(link.studentId)}
                                                disabled={loading === link.studentId}
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
