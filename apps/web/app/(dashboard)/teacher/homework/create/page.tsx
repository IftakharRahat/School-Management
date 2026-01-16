'use client';

import { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { ClipboardList, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateHomeworkPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        classId: '',
        sectionId: '',
        subjectId: '',
        dueDate: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        // Fetch classes and subjects for the teacher
        const res = await fetch('/api/teacher/homework-options');
        if (res.ok) {
            const data = await res.json();
            setClasses(data.classes || []);
            setSubjects(data.subjects || []);
        }
    }

    function handleClassChange(classId: string) {
        setFormData({ ...formData, classId, sectionId: '' });
        const selectedClass = classes.find(c => c.id === classId);
        setSections(selectedClass?.sections || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/teacher/homework', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/teacher/homework');
            } else {
                alert('Failed to create homework');
            }
        } catch (error) {
            alert('Error creating homework');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-[800px] mx-auto">
            <div className="mb-6">
                <Link href="/teacher/homework" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
                    <ArrowLeft size={16} /> Back to Homework
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="text-blue-600" />
                    Create Assignment
                </h1>
                <p className="text-slate-500 mt-1">Create a new homework assignment</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Chapter 5 Practice Problems"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the assignment..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
                        <select
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.classId}
                            onChange={e => handleClassChange(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.sectionId}
                            onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                        >
                            <option value="">All Sections</option>
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                        <select
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.subjectId}
                            onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        <Save size={18} />
                        {loading ? 'Creating...' : 'Create Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
