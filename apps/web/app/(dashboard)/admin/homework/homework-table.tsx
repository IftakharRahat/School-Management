'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, Pencil, Trash2, Users, BookOpen } from 'lucide-react';
import { deleteHomework, updateHomeworkStatus } from './actions';

interface Homework {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    maxPoints: number;
    status: string;
    class: { name: string };
    section: { name: string } | null;
    subject: { name: string };
    teacher: { user: { name: string } };
    _count: { submissions: number };
}

interface HomeworkTableProps {
    homeworks: Homework[];
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    };
}

export default function HomeworkTable({ homeworks, pagination }: HomeworkTableProps) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this homework?')) return;
        try {
            await deleteHomework(id);
            router.refresh();
        } catch (error) {
            alert('Failed to delete homework');
        }
    };

    const handleStatusChange = async (id: string, status: any) => {
        try {
            await updateHomeworkStatus(id, status);
            router.refresh();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'DRAFT': return 'bg-slate-100 text-slate-700';
            case 'CLOSED': return 'bg-blue-100 text-blue-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverdue = (date: Date) => {
        return new Date(date) < new Date();
    };

    if (homeworks.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Homework Yet</h3>
                <p className="text-slate-500 mb-6">Create your first homework assignment</p>
                <Link
                    href="/admin/homework/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    Create Homework
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Class</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Subject</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Due Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Submissions</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {homeworks.map((homework) => (
                        <tr key={homework.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <Link href={`/admin/homework/${homework.id}`} className="font-medium text-blue-600 hover:underline">
                                    {homework.title}
                                </Link>
                                <p className="text-sm text-slate-500 truncate max-w-xs">
                                    {homework.description.substring(0, 50)}...
                                </p>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {homework.class.name}
                                {homework.section && ` - ${homework.section.name}`}
                            </td>
                            <td className="px-6 py-4 text-slate-600">{homework.subject.name}</td>
                            <td className="px-6 py-4">
                                <span className={`flex items-center gap-1 text-sm ${isOverdue(homework.dueDate) && homework.status === 'ACTIVE' ? 'text-red-600' : 'text-slate-600'}`}>
                                    <Calendar size={14} />
                                    {formatDate(homework.dueDate)}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="flex items-center gap-1 text-sm text-slate-600">
                                    <Users size={14} />
                                    {homework._count.submissions}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    value={homework.status}
                                    onChange={(e) => handleStatusChange(homework.id, e.target.value)}
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(homework.status)}`}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/homework/${homework.id}`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Eye size={16} />
                                    </Link>
                                    <Link
                                        href={`/admin/homework/${homework.id}/edit`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(homework.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    <p className="text-sm text-slate-500">
                        Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
                    </p>
                    <div className="flex gap-2">
                        {pagination.page > 1 && (
                            <Link
                                href={`/admin/homework?page=${pagination.page - 1}`}
                                className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
                            >
                                Previous
                            </Link>
                        )}
                        {pagination.page < pagination.totalPages && (
                            <Link
                                href={`/admin/homework?page=${pagination.page + 1}`}
                                className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
