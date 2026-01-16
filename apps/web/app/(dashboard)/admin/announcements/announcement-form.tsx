'use client';

import { useState } from 'react';
import { Plus, X, Send, Loader2 } from 'lucide-react';
import { createAnnouncement } from './actions';

const TYPES = [
    { value: 'GENERAL', label: 'General' },
    { value: 'EXAM', label: 'Exam' },
    { value: 'EVENT', label: 'Event' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'EMERGENCY', label: 'Emergency' },
];

const PRIORITIES = [
    { value: 'LOW', label: 'Low' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

export default function AnnouncementForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'GENERAL',
        priority: 'NORMAL',
        endDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await createAnnouncement({
            ...form,
            type: form.type as 'GENERAL' | 'EXAM' | 'EVENT' | 'HOLIDAY' | 'EMERGENCY',
            priority: form.priority as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
            endDate: form.endDate || null,
        });

        if (result?.success) {
            setForm({ title: '', content: '', type: 'GENERAL', priority: 'NORMAL', endDate: '' });
            setIsOpen(false);
        } else {
            alert(result?.error || 'Failed to create');
        }

        setIsSubmitting(false);
    };

    return (
        <div>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                    <Plus size={20} />
                    New Announcement
                </button>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Create Announcement</h2>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Announcement title..."
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                            <textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                placeholder="Write your announcement..."
                                rows={4}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    {TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    {PRIORITIES.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Publish
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
