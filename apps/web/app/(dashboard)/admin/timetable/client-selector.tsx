'use client';

import { useRouter } from 'next/navigation';

interface ClientSelectorProps {
    classes: any[];
    selectedClassId?: string;
    selectedSectionId?: string;
}

export default function ClientSelector({ classes, selectedClassId, selectedSectionId }: ClientSelectorProps) {
    const router = useRouter();

    const activeClass = classes.find(c => c.id === selectedClassId);

    const updateUrl = (clsId: string, secId: string) => {
        const params = new URLSearchParams();
        if (clsId) params.set('classId', clsId);
        if (secId) params.set('sectionId', secId);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                <select
                    value={selectedClassId || ''}
                    onChange={(e) => updateUrl(e.target.value, '')}
                    className="w-48 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
                <select
                    value={selectedSectionId || ''}
                    onChange={(e) => updateUrl(selectedClassId!, e.target.value)}
                    disabled={!selectedClassId}
                    className="w-48 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                >
                    <option value="">Select Section</option>
                    {activeClass?.sections.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
