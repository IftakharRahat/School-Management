'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar } from 'lucide-react';
import { createExam } from './actions';

interface ExamFormProps {
    classes: any[];
    branchId: string;
    onSuccess?: () => void;
}

export default function ExamForm({ classes, branchId, onSuccess }: ExamFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            classId: formData.get('classId'),
            type: formData.get('type'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
        };

        try {
            await createExam(branchId, data);
            router.refresh();
            if (onSuccess) onSuccess();
            // Reset form?
            (e.target as HTMLFormElement).reset();
            alert("Exam created successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to create exam");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name</label>
                    <input
                        name="name"
                        required
                        placeholder="e.g. Final Term 2024"
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
                    <select
                        name="type"
                        required
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    >
                        <option value="FIRST_TERM">First Term</option>
                        <option value="HALF_YEARLY">Half Yearly</option>
                        <option value="FINAL">Final</option>
                        <option value="UNIT_TEST">Unit Test</option>
                        <option value="CLASS_TEST">Class Test</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                    <select
                        name="classId"
                        required
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} (Grade {c.grade})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                        name="startDate"
                        type="date"
                        required
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                    <input
                        name="endDate"
                        type="date"
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Create Exam
                </button>
            </div>
        </form>
    );
}
