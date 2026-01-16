'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, Users } from 'lucide-react';
import { deleteClass, deleteSection } from './actions';
import { useRouter } from 'next/navigation';

interface Section {
    id: string;
    name: string;
    capacity: number | null;
}

interface ClassWithSections {
    id: string;
    name: string;
    grade: number;
    sections: Section[];
    _count: { sections: number };
}

interface ClassTableProps {
    classes: ClassWithSections[];
}

export default function ClassTable({ classes }: ClassTableProps) {
    const router = useRouter();
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class? All sections will be deleted too.')) return;
        setDeletingId(id);
        try {
            await deleteClass(id);
            router.refresh();
        } catch (error) {
            alert('Failed to delete class');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await deleteSection(id);
            router.refresh();
        } catch (error) {
            alert('Failed to delete section');
        }
    };

    if (classes.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Classes Yet</h3>
                <p className="text-slate-500 mb-6">Get started by creating your first class</p>
                <Link
                    href="/admin/classes/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Class
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="w-12 px-4 py-4"></th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Class Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Grade</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Sections</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map((classItem) => (
                        <>
                            <tr key={classItem.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => toggleRow(classItem.id)}
                                        className="p-1 hover:bg-slate-100 rounded"
                                    >
                                        {expandedRows.has(classItem.id) ? (
                                            <ChevronDown size={18} className="text-slate-400" />
                                        ) : (
                                            <ChevronRight size={18} className="text-slate-400" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-slate-800">{classItem.name}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{classItem.grade}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {classItem._count.sections} section{classItem._count.sections !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/classes/${classItem.id}/edit`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClass(classItem.id)}
                                            disabled={deletingId === classItem.id}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedRows.has(classItem.id) && classItem.sections.length > 0 && (
                                <tr key={`${classItem.id}-sections`}>
                                    <td colSpan={5} className="px-12 py-4 bg-slate-50/50">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-slate-600 mb-3">Sections</h4>
                                            {classItem.sections.map((section) => (
                                                <div
                                                    key={section.id}
                                                    className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100"
                                                >
                                                    <div>
                                                        <span className="font-medium text-slate-800">Section {section.name}</span>
                                                        {section.capacity && (
                                                            <span className="ml-3 text-sm text-slate-500">
                                                                Capacity: {section.capacity}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/sections/${section.id}`}
                                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Manage
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteSection(section.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
