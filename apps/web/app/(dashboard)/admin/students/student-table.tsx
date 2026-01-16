'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Student {
    id: string;
    admissionNo: string;
    dateOfBirth: Date | null;
    gender: string | null;
    bloodGroup: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
    };
    guardians: {
        guardian: {
            user: { name: string; phone: string | null };
        };
    }[];
    enrollments: {
        section: {
            name: string;
            class: { name: string };
        };
        rollNumber: string | null;
    }[];
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface StudentTableProps {
    students: Student[];
    pagination: Pagination;
}

export default function StudentTable({ students, pagination }: StudentTableProps) {
    const router = useRouter();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage.toString());
        router.push(`/admin/students?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Student</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Admission No</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Class</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Guardian</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Contact</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Gender</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-500">
                                    No students found. Click &quot;Add Student&quot; to create one.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    {/* Student Info */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                                                {student.user.avatar ? (
                                                    <Image src={student.user.avatar} alt="" width={40} height={40} className="object-cover" />
                                                ) : (
                                                    student.user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{student.user.name}</p>
                                                <p className="text-sm text-slate-500">{student.user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Admission No */}
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-medium text-slate-700">{student.admissionNo}</span>
                                    </td>

                                    {/* Class */}
                                    <td className="py-4 px-4">
                                        {student.enrollments[0] ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">
                                                {student.enrollments[0].section.class.name} - {student.enrollments[0].section.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">Not enrolled</span>
                                        )}
                                    </td>

                                    {/* Guardian */}
                                    <td className="py-4 px-4">
                                        {student.guardians[0] ? (
                                            <div>
                                                <p className="text-sm text-slate-700">{student.guardians[0].guardian.user.name}</p>
                                                <p className="text-xs text-slate-500">{student.guardians[0].guardian.user.phone}</p>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-sm">—</span>
                                        )}
                                    </td>

                                    {/* Contact */}
                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-600">{student.user.phone || '—'}</p>
                                    </td>

                                    {/* Gender */}
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${student.gender === 'MALE' ? 'bg-blue-50 text-blue-600' :
                                            student.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' :
                                                'bg-slate-50 text-slate-600'
                                            }`}>
                                            {student.gender}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-4 px-4">
                                        <div className="relative flex justify-center">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={18} className="text-slate-400" />
                                            </button>

                                            {openMenuId === student.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]">
                                                    <Link
                                                        href={`/admin/students/${student.id}`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/admin/students/${student.id}/edit`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            // TODO: Add delete confirmation
                                                            setOpenMenuId(null);
                                                        }}
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
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${pageNum === pagination.page
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
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
