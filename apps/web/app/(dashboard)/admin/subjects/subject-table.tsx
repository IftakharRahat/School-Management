'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, BookOpen, Users } from 'lucide-react';
import { deleteSubject } from './actions';

interface Subject {
    id: string;
    name: string;
    code: string;
    creditHours: number;
    isOptional: boolean;
    class: {
        id: string;
        name: string;
        grade: number;
    };
    _count: {
        assignments: number;
    };
}

interface SubjectTableProps {
    subjects: Subject[];
}

export default function SubjectTable({ subjects }: SubjectTableProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        setLoading(id);
        try {
            await deleteSubject(id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete subject:', error);
            alert('Failed to delete subject');
        } finally {
            setLoading(null);
        }
    };

    // Group subjects by class
    const groupedSubjects = subjects.reduce((acc, subject) => {
        const className = subject.class.name;
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(subject);
        return acc;
    }, {} as Record<string, Subject[]>);

    if (subjects.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No subjects found</h3>
                <p className="text-slate-500 mb-4">Get started by creating a new subject</p>
                <Link
                    href="/admin/subjects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Subject
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedSubjects).map(([className, classSubjects]) => (
                <div key={className} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900">{className}</h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Subject</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Code</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Credit Hours</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Teachers</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classSubjects.map((subject) => (
                                <tr key={subject.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-slate-900">{subject.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-mono">
                                            {subject.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{subject.creditHours}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.isOptional
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {subject.isOptional ? 'Optional' : 'Compulsory'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Users className="w-4 h-4" />
                                            <span>{subject._count.assignments}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/subjects/${subject.id}/edit`}
                                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                disabled={loading === subject.id}
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
                </div>
            ))}
        </div>
    );
}
