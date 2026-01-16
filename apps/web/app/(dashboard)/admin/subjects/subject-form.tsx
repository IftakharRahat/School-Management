'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSubject, updateSubject } from './actions';

interface ClassOption {
    id: string;
    name: string;
    grade: number;
}

interface SubjectFormProps {
    classes: ClassOption[];
    initialData?: {
        name: string;
        code: string;
        classId: string;
        creditHours: number;
        isOptional: boolean;
    };
    isEditing?: boolean;
    subjectId?: string;
}

export default function SubjectForm({
    classes,
    initialData,
    isEditing = false,
    subjectId,
}: SubjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        classId: initialData?.classId || '',
        creditHours: initialData?.creditHours || 1,
        isOptional: initialData?.isOptional || false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing && subjectId) {
                await updateSubject(subjectId, formData);
            } else {
                await createSubject(formData);
            }
            router.push('/admin/subjects');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Subject Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Mathematics"
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject Code *
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., MATH101"
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Class *
                        </label>
                        <select
                            value={formData.classId}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                            required
                            disabled={isEditing}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Credit Hours
                        </label>
                        <input
                            type="number"
                            value={formData.creditHours}
                            onChange={(e) => setFormData({ ...formData, creditHours: parseFloat(e.target.value) || 1 })}
                            min="0"
                            step="0.5"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isOptional}
                                onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">
                                This is an optional subject
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                    {loading ? 'Saving...' : isEditing ? 'Update Subject' : 'Create Subject'}
                </button>
            </div>
        </form>
    );
}
