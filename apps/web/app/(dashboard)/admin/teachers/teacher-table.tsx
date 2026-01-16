'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Teacher {
    id: string;
    employeeId: string;
    designation: string;
    department: string | null;
    qualification: string | null;
    specialization: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface TeacherTableProps {
    teachers: Teacher[];
    pagination: Pagination;
}

export default function TeacherTable({ teachers, pagination }: TeacherTableProps) {
    const router = useRouter();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage.toString());
        router.push(`/admin/teachers?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Teacher</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Employee ID</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Designation</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Department</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Contact</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-500">
                                    No teachers found. Click &quot;Add Teacher&quot; to create one.
                                </td>
                            </tr>
                        ) : (
                            teachers.map((teacher) => (
                                <tr key={teacher.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                                                {teacher.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{teacher.user.name}</p>
                                                <p className="text-sm text-slate-500">{teacher.user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">
                                        <span className="text-sm font-medium text-slate-700">{teacher.employeeId}</span>
                                    </td>

                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-700">{teacher.designation}</span>
                                    </td>

                                    <td className="py-4 px-4">
                                        {teacher.department ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-purple-50 text-purple-700">
                                                {teacher.department}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">—</span>
                                        )}
                                    </td>

                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-600">{teacher.user.phone || '—'}</p>
                                    </td>

                                    <td className="py-4 px-4">
                                        <div className="relative flex justify-center">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === teacher.id ? null : teacher.id)}
                                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={18} className="text-slate-400" />
                                            </button>

                                            {openMenuId === teacher.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]">
                                                    <Link
                                                        href={`/admin/teachers/${teacher.id}`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/admin/teachers/${teacher.id}/edit`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} className="text-slate-600" />
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} className="text-slate-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
