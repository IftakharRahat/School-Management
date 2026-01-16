'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Users, Plus, Trash2, Save } from 'lucide-react';
import { assignClassTeacher, enrollStudent, unenrollStudent } from '../../classes/actions';

interface Teacher {
    id: string;
    user: { name: string; email: string };
}

interface Student {
    id: string;
    admissionNo: string;
    user: { name: string };
}

interface Enrollment {
    id: string;
    rollNumber?: string | null;
    student: Student;
}

interface Section {
    id: string;
    name: string;
    classTeacherId?: string | null;
    classTeacher?: { id: string; user: { name: string } } | null;
    enrollments: Enrollment[];
}

interface SectionManagementProps {
    section: Section;
    teachers: Teacher[];
    availableStudents: Student[];
    academicYearId: string;
}

export default function SectionManagement({
    section,
    teachers,
    availableStudents,
    academicYearId,
}: SectionManagementProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Class Teacher State
    const [selectedTeacher, setSelectedTeacher] = useState(section.classTeacherId || '');

    // Enrollment State
    const [selectedStudent, setSelectedStudent] = useState('');
    const [rollNumber, setRollNumber] = useState('');

    const handleAssignTeacher = async () => {
        setLoading('teacher');
        setError(null);

        try {
            await assignClassTeacher(section.id, selectedTeacher || null);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to assign teacher');
        } finally {
            setLoading(null);
        }
    };

    const handleEnrollStudent = async () => {
        if (!selectedStudent || !academicYearId) return;

        setLoading('enroll');
        setError(null);

        try {
            await enrollStudent(selectedStudent, section.id, academicYearId, rollNumber || undefined);
            setSelectedStudent('');
            setRollNumber('');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to enroll student');
        } finally {
            setLoading(null);
        }
    };

    const handleUnenroll = async (enrollmentId: string) => {
        if (!confirm('Are you sure you want to remove this student from this section?')) return;

        setLoading(enrollmentId);
        setError(null);

        try {
            await unenrollStudent(enrollmentId);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to remove student');
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

            {!academicYearId && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
                    No academic year is set as current. Please configure an academic year before enrolling students.
                </div>
            )}

            {/* Class Teacher Assignment */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Class Teacher
                </h2>

                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Assigned Teacher
                        </label>
                        <select
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">No Class Teacher</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.user.name} ({teacher.user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAssignTeacher}
                        disabled={loading === 'teacher'}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>

                {section.classTeacher && (
                    <p className="mt-3 text-sm text-slate-500">
                        Current: <span className="font-medium text-slate-700">{section.classTeacher.user.name}</span>
                    </p>
                )}
            </div>

            {/* Student Enrollment */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Enrolled Students ({section.enrollments.length})
                    </h2>
                </div>

                {/* Add Student Form */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Add Student
                            </label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                disabled={!academicYearId}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                            >
                                <option value="">Select a student</option>
                                {availableStudents.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.user.name} ({student.admissionNo})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Roll No
                            </label>
                            <input
                                type="text"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                placeholder="Optional"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleEnrollStudent}
                            disabled={!selectedStudent || !academicYearId || loading === 'enroll'}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Enroll
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                {section.enrollments.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No students enrolled</h3>
                        <p className="text-slate-500">Add students to this section using the form above</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Roll</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Student</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Admission No</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {section.enrollments.map((enrollment, index) => (
                                <tr key={enrollment.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-600">
                                        {enrollment.rollNumber || index + 1}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {enrollment.student.user.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {enrollment.student.admissionNo}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleUnenroll(enrollment.id)}
                                                disabled={loading === enrollment.id}
                                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Remove from section"
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
