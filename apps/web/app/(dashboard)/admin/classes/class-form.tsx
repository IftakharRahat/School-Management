'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { createClass, updateClass, createSection, type ClassFormData, type SectionFormData } from './actions';

interface Section {
    id?: string;
    name: string;
    capacity: number | null;
    isNew?: boolean;
}

interface ClassFormProps {
    branchId: string;
    initialData?: {
        id: string;
        name: string;
        grade: number;
        sections: Section[];
    };
    isEditing?: boolean;
}

export default function ClassForm({ branchId, initialData, isEditing = false }: ClassFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sections, setSections] = useState<Section[]>(
        initialData?.sections || [{ name: 'A', capacity: 40, isNew: true }]
    );
    const [newSectionName, setNewSectionName] = useState('');

    const handleAddSection = () => {
        if (!newSectionName.trim()) return;
        setSections([...sections, { name: newSectionName.trim(), capacity: 40, isNew: true }]);
        setNewSectionName('');
    };

    const handleRemoveSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const data: ClassFormData = {
            name: formData.get('name') as string,
            grade: parseInt(formData.get('grade') as string, 10),
        };

        try {
            if (isEditing && initialData?.id) {
                await updateClass(initialData.id, data);
                // Create any new sections
                for (const section of sections) {
                    if (section.isNew) {
                        await createSection(initialData.id, {
                            name: section.name,
                            capacity: section.capacity,
                        });
                    }
                }
            } else {
                const newClass = await createClass(data, branchId);
                // Create sections for the new class
                for (const section of sections) {
                    await createSection(newClass.id, {
                        name: section.name,
                        capacity: section.capacity,
                    });
                }
            }
            router.push('/admin/classes');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save class');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Class Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Class Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            defaultValue={initialData?.name}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g., Class 1, Class 10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Grade <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="grade"
                            required
                            defaultValue={initialData?.grade || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select grade</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                <option key={grade} value={grade}>
                                    Grade {grade}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Sections</h2>

                {/* Existing Sections */}
                <div className="space-y-3 mb-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl"
                        >
                            <span className="font-medium text-slate-800 flex-1">
                                Section {section.name}
                            </span>
                            <input
                                type="number"
                                value={section.capacity || ''}
                                onChange={(e) => {
                                    const updated = [...sections];
                                    updated[index].capacity = parseInt(e.target.value, 10) || null;
                                    setSections(updated);
                                }}
                                className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                placeholder="Capacity"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveSection(index)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Section */}
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Section name (e.g., B, C)"
                    />
                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        <Plus size={18} />
                        Add Section
                    </button>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
                <Link
                    href="/admin/classes"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Classes
                </Link>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            {isEditing ? 'Update Class' : 'Create Class'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
