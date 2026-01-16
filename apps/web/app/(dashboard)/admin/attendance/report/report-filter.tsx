'use client';

import { useRouter } from 'next/navigation';

interface ReportFilterProps {
    classes: any[];
    selectedClassId?: string;
    selectedSectionId?: string;
    selectedMonth: number;
    selectedYear: number;
}

export default function ReportFilter({
    classes,
    selectedClassId,
    selectedSectionId,
    selectedMonth,
    selectedYear
}: ReportFilterProps) {
    const router = useRouter();
    const activeClass = classes.find(c => c.id === selectedClassId);

    // Generate Year Options (Current +/- 2)
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const updateUrl = (clsId: string, secId: string, m: number, y: number) => {
        const params = new URLSearchParams();
        if (clsId) params.set('classId', clsId);
        if (secId) params.set('sectionId', secId);
        params.set('month', m.toString());
        params.set('year', y.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-lg border border-slate-200">
            {/* Month */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Month</label>
                <select
                    value={selectedMonth}
                    onChange={(e) => updateUrl(selectedClassId || '', selectedSectionId || '', parseInt(e.target.value), selectedYear)}
                    className="w-32 p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                </select>
            </div>

            {/* Year */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Year</label>
                <select
                    value={selectedYear}
                    onChange={(e) => updateUrl(selectedClassId || '', selectedSectionId || '', selectedMonth, parseInt(e.target.value))}
                    className="w-24 p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {/* Class */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Class</label>
                <select
                    value={selectedClassId || ''}
                    onChange={(e) => updateUrl(e.target.value, '', selectedMonth, selectedYear)}
                    className="w-40 p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Section */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Section</label>
                <select
                    value={selectedSectionId || ''}
                    onChange={(e) => updateUrl(selectedClassId!, e.target.value, selectedMonth, selectedYear)}
                    disabled={!selectedClassId}
                    className="w-40 p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                >
                    <option value="">Select Section</option>
                    {activeClass?.sections.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="ml-auto">
                <button
                    onClick={() => window.print()}
                    className="text-sm text-blue-600 hover:underline print:hidden"
                >
                    Print Report
                </button>
            </div>
        </div>
    );
}
