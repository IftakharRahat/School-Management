'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, Check, Loader2, Trash2 } from 'lucide-react';
import { getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } from './actions';

interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    _count: { enrollments: number };
}

export default function AcademicYears() {
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        isCurrent: false
    });

    useEffect(() => {
        loadYears();
    }, []);

    async function loadYears() {
        setLoading(true);
        try {
            const data = await getAcademicYears();
            // Prisma dates come as Date objects, but over network they might be strings in client component if passed directly? 
            // Wait, getAcademicYears is a server action. It returns Date objects. Next.js serializes them.
            // We'll cast to any for safety or assume serialization.
            setYears(data as any);
        } catch (error) {
            console.error("Failed to load years", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAcademicYear({
                name: formData.name,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                isCurrent: formData.isCurrent
            });
            setIsCreating(false);
            setFormData({ name: '', startDate: '', endDate: '', isCurrent: false });
            loadYears();
        } catch (error) {
            alert('Failed to create academic year');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSetCurrent(id: string) {
        if (!confirm('Are you sure you want to set this as the active academic year? This will unset the current active year.')) return;
        try {
            await updateAcademicYear(id, { isCurrent: true });
            loadYears();
        } catch (error) {
            alert('Failed to update');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this academic year?')) return;
        try {
            const res = await deleteAcademicYear(id);
            if (!res.success) throw new Error(res.error);
            loadYears();
        } catch (error: any) {
            alert(error.message || 'Failed to delete');
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading academic years...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Academic Years</h2>
                    <p className="text-sm text-slate-500">Manage school sessions and terms.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    {isCreating ? 'Cancel' : <><Plus size={16} /> Add New Year</>}
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-50 border p-6 rounded-xl animate-in slide-in-from-top-2">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Year Name (e.g. 2024-2025)</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isCurrent"
                                className="w-4 h-4 text-blue-600 rounded"
                                checked={formData.isCurrent}
                                onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })}
                            />
                            <label htmlFor="isCurrent" className="text-sm text-slate-700">Set as current Active Year</label>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                            >
                                {submitting ? 'Saving...' : 'Save Academic Year'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium text-slate-500">Name</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Duration</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Data</th>
                            <th className="px-6 py-3 font-medium text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                        {years.map((year) => (
                            <tr key={year.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{year.name}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {format(new Date(year.startDate), 'MMM yyyy')} - {format(new Date(year.endDate), 'MMM yyyy')}
                                </td>
                                <td className="px-6 py-4">
                                    {year.isCurrent ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                            <Check size={12} /> Active
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {year._count?.enrollments || 0} enrollments
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {!year.isCurrent && (
                                        <button
                                            onClick={() => handleSetCurrent(year.id)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Set Active
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(year.id)}
                                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {years.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                                    No academic years found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
