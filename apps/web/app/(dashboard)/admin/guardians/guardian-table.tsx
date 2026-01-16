'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2, Users } from 'lucide-react';
import { deleteGuardian } from './actions';
import { useRouter } from 'next/navigation';

interface Guardian {
    id: string;
    occupation: string | null;
    workplace: string | null;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
    students: {
        student: {
            user: { name: string };
        };
    }[];
}

interface GuardianTableProps {
    guardians: Guardian[];
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    };
}

export default function GuardianTable({ guardians, pagination }: GuardianTableProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this guardian?')) return;
        setDeletingId(id);
        try {
            await deleteGuardian(id);
            router.refresh();
        } catch (error) {
            alert('Failed to delete guardian');
        } finally {
            setDeletingId(null);
        }
    };

    if (guardians.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Guardians Yet</h3>
                <p className="text-slate-500 mb-6">Get started by adding your first guardian</p>
                <Link
                    href="/admin/guardians/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    Add Guardian
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Occupation</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Children</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {guardians.map((guardian) => (
                        <tr key={guardian.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <span className="font-medium text-slate-800">{guardian.user.name}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-slate-600">{guardian.user.email}</div>
                                <div className="text-sm text-slate-400">{guardian.user.phone}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {guardian.occupation || '-'}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                    {guardian.students.length} student{guardian.students.length !== 1 ? 's' : ''}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/guardians/${guardian.id}`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Eye size={16} />
                                    </Link>
                                    <Link
                                        href={`/admin/guardians/${guardian.id}/edit`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(guardian.id)}
                                        disabled={deletingId === guardian.id}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Showing {guardians.length} of {pagination.total} guardians
                    </span>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/admin/guardians?page=${page}`}
                                className={`px-3 py-1 rounded-lg text-sm ${page === pagination.page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
