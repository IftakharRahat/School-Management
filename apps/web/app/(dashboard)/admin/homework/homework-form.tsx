'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHomework, updateHomework } from './actions';

interface ClassWithSubjects {
    id: string;
    name: string;
    sections: { id: string; name: string }[];
    subjects: { id: string; name: string }[];
}

interface Teacher {
    id: string;
    user: { name: string };
}

interface HomeworkFormProps {
    classes: ClassWithSubjects[];
    teacherId: string | null; // Nullable if admin
    teachers?: Teacher[]; // Optional list for admins
    initialData?: {
        id: string;
        title: string;
        description: string;
        classId: string;
        sectionId: string | null;
        subjectId: string;
        dueDate: Date;
        maxPoints: number;
        attachmentUrl: string | null;
    };
}

export default function HomeworkForm({ classes, teacherId, teachers, initialData }: HomeworkFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        classId: initialData?.classId || '',
        sectionId: initialData?.sectionId || '',
        subjectId: initialData?.subjectId || '',
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        maxPoints: initialData?.maxPoints || 100,
        attachmentUrl: initialData?.attachmentUrl || '',
        selectedTeacherId: teacherId || '', // Default to passed ID or empty
    });

    const selectedClass = classes.find(c => c.id === formData.classId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Ensure we have a teacher ID
        const finalTeacherId = formData.selectedTeacherId;
        if (!finalTeacherId) {
            setError('Teacher is required');
            setLoading(false);
            return;
        }

        try {
            if (initialData) {
                await updateHomework(initialData.id, formData);
            } else {
                await createHomework({
                    ...formData,
                    sectionId: formData.sectionId || null,
                    attachmentUrl: formData.attachmentUrl || null,
                }, finalTeacherId);
            }
            router.push('/admin/homework');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to save homework');
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
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Homework Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Admin Teacher Selection */}
                    {!teacherId && teachers && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Assign As Teacher <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.selectedTeacherId}
                                onChange={(e) => setFormData({ ...formData, selectedTeacherId: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a Teacher</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.user.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Since you are an admin, select which teacher is assigning this work.</p>
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Chapter 5 Exercise"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the homework assignment..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.classId}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value, sectionId: '', subjectId: '' })}
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Section (Optional)
                        </label>
                        <select
                            value={formData.sectionId}
                            onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                            disabled={!selectedClass}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                        >
                            <option value="">All Sections</option>
                            {selectedClass?.sections.map((section) => (
                                <option key={section.id} value={section.id}>Section {section.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.subjectId}
                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                            required
                            disabled={!selectedClass}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                        >
                            <option value="">Select Subject</option>
                            {selectedClass?.subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Max Points
                        </label>
                        <input
                            type="number"
                            value={formData.maxPoints}
                            onChange={(e) => setFormData({ ...formData, maxPoints: Number(e.target.value) })}
                            min={1}
                            max={1000}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Attachment URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.attachmentUrl}
                            onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : initialData ? 'Update Homework' : 'Create Homework'}
                </button>
            </div>
        </form>
    );
}
