'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { createFeeHead, deleteFeeHead } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
            {pending ? 'Creating...' : 'Create Fee Head'}
        </button>
    );
}

export default function FeeHeadList({ feeHeads }: { feeHeads: any[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [error, setError] = useState('');

    async function handleCreate(formData: FormData) {
        const result = await createFeeHead(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setIsCreateOpen(false);
            setError('');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This will delete all associated structures.')) return;
        const result = await deleteFeeHead(id);
        if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Fee Configuration</h1>
                    <p className="text-slate-500 mt-1">Manage fee types for your school</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                    <Plus size={20} />
                    Add Fee Head
                </button>
            </div>

            {isCreateOpen && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4">New Fee Head</h3>
                    <form action={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Tuition Fee"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                <select
                                    name="frequency"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="ONE_TIME">One Time</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="HALF_YEARLY">Half Yearly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isOptional"
                                id="isOptional"
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isOptional" className="text-sm text-slate-700">Optional Fee (e.g. Transport)</label>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <div className="w-32">
                                <SubmitButton />
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feeHeads.map((head) => (
                    <div key={head.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{head.name}</h3>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {head.frequency}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(head.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="text-sm text-slate-500">
                            {head.isOptional ? 'Optional Fee' : 'Mandatory Fee'}
                        </div>
                    </div>
                ))}

                {feeHeads.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        No fee heads configured yet.
                    </div>
                )}
            </div>
        </div>
    );
}
