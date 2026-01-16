'use client';

import { Trash2, AlertTriangle, Info, AlertCircle, Bell, Calendar, Gift, Zap } from 'lucide-react';
import { deleteAnnouncement, togglePublished } from './actions';

type Announcement = {
    id: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    startDate: Date;
    endDate: Date | null;
    isPublished: boolean;
};

const PRIORITY_STYLES: Record<string, { bg: string; icon: React.ReactNode }> = {
    LOW: { bg: 'bg-slate-50 border-slate-200', icon: <Info className="text-slate-400" size={18} /> },
    NORMAL: { bg: 'bg-blue-50 border-blue-200', icon: <Bell className="text-blue-500" size={18} /> },
    HIGH: { bg: 'bg-orange-50 border-orange-200', icon: <AlertCircle className="text-orange-500" size={18} /> },
    URGENT: { bg: 'bg-red-50 border-red-200', icon: <AlertTriangle className="text-red-500" size={18} /> },
};

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
    GENERAL: { bg: 'bg-slate-100', text: 'text-slate-600' },
    EXAM: { bg: 'bg-purple-100', text: 'text-purple-600' },
    EVENT: { bg: 'bg-green-100', text: 'text-green-600' },
    HOLIDAY: { bg: 'bg-pink-100', text: 'text-pink-600' },
    EMERGENCY: { bg: 'bg-red-100', text: 'text-red-600' },
};

export default function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            await deleteAnnouncement(id);
        }
    };

    if (announcements.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No announcements yet.</p>
                <p className="text-sm text-slate-400">Create your first announcement to notify everyone.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {announcements.map((a) => {
                const style = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.NORMAL;
                const typeBadge = TYPE_BADGES[a.type] || TYPE_BADGES.GENERAL;
                return (
                    <div
                        key={a.id}
                        className={`${style.bg} border rounded-xl p-5 transition-all hover:shadow-sm`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{style.icon}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs ${typeBadge.bg} ${typeBadge.text} px-2 py-0.5 rounded-full font-medium`}>
                                            {a.type}
                                        </span>
                                        <h3 className="font-bold text-slate-800">{a.title}</h3>
                                    </div>
                                    <p className="text-slate-600 whitespace-pre-wrap">{a.content}</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                        <span>
                                            {new Date(a.startDate).toLocaleDateString('en-BD', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        {a.endDate && (
                                            <span className="text-orange-500">
                                                Expires: {new Date(a.endDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    className="p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
