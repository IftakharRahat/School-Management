'use client';

import { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthlyReport } from './actions';

type MonthlyReport = Awaited<ReturnType<typeof getMonthlyReport>>;

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyReportView({ initialReport }: { initialReport: MonthlyReport }) {
    const [report, setReport] = useState(initialReport);
    const [isLoading, setIsLoading] = useState(false);

    const changeMonth = async (delta: number) => {
        if (!report) return;

        let newMonth = report.month + delta;
        let newYear = report.year;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        setIsLoading(true);
        const newReport = await getMonthlyReport(newMonth, newYear);
        setReport(newReport);
        setIsLoading(false);
    };

    if (!report) {
        return <div className="text-center py-8 text-slate-500">No data available</div>;
    }

    return (
        <div className="space-y-6">
            {/* Month selector */}
            <div className="flex items-center justify-center gap-4 bg-white rounded-xl p-4 border border-slate-200">
                <button
                    onClick={() => changeMonth(-1)}
                    disabled={isLoading}
                    className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 min-w-[200px] text-center">
                    {MONTH_NAMES[report.month - 1]} {report.year}
                </h2>
                <button
                    onClick={() => changeMonth(1)}
                    disabled={isLoading}
                    className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <p className="text-sm text-slate-500">Total Due</p>
                    <p className="text-2xl font-bold text-slate-800">৳{report.totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <p className="text-sm text-slate-500">Collected</p>
                    <p className="text-2xl font-bold text-green-600">৳{report.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <p className="text-sm text-slate-500">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">৳{report.totalPending.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <p className="text-sm text-slate-500">Collection Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{report.collectionRate}%</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Collection Progress</span>
                    <span className="font-medium">{report.collectionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                        style={{ width: `${report.collectionRate}%` }}
                    />
                </div>
            </div>

            {/* By Fee Head */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Breakdown by Fee Type</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Fee Type</th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Total</th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Paid</th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Pending</th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {report.byFeeHead.map((fh, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-800 font-medium">{fh.name}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">৳{fh.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-green-600">৳{fh.paid.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-orange-600">৳{fh.pending.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {fh.total > 0 ? Math.round((fh.paid / fh.total) * 100) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
