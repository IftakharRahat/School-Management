'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimetableGrid from './timetable-grid';

interface ScheduleManagerProps {
    classes: any[];
    teachers: any[];
    subjects: any[];
}

export default function ScheduleManager({ classes, teachers, subjects }: ScheduleManagerProps) {
    const router = useRouter();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const activeClass = classes.find(c => c.id === selectedClassId);

    const handleClassChange = (classId: string) => {
        setSelectedClassId(classId);
        setSelectedSectionId('');
        setTimetable([]);
    };

    const handleSectionChange = async (sectionId: string) => {
        setSelectedSectionId(sectionId);
        if (!sectionId) {
            setTimetable([]);
            return;
        }

        setLoading(true);
        // We'll fetch the timetable data dynamically or via server action prop if we decide to re-fetch
        // For simplicity in Client Component, we can use a server action that returns data
        try {
            // This part is a bit tricky in Client Components without pure SWR/React Query.
            // Better to let the parent Page handle data fetching via URL params?
            // Actually, dynamic URL params is the "Next.js way".
            // So this component should just be a selector that pushes to URL.
            router.push(`?classId=${selectedClassId}&sectionId=${sectionId}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg"
                        >
                            <option value="">Choose Class...</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Section</label>
                        <select
                            value={selectedSectionId}
                            onChange={(e) => handleSectionChange(e.target.value)}
                            disabled={!selectedClassId}
                            className="w-full p-2 border border-slate-200 rounded-lg disabled:bg-slate-100"
                        >
                            <option value="">Choose Section...</option>
                            {activeClass?.sections.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
