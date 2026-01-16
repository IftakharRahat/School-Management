'use client';

import { Phone, AlertTriangle } from 'lucide-react';

type Defaulter = {
    studentId: string;
    name: string;
    phone: string | null;
    class: string;
    section: string;
    totalDue: number;
    fees: Array<{ feeHead: string; amount: number; dueDate: Date }>;
};

export default function DefaultersView({ defaulters }: { defaulters: Defaulter[] }) {
    if (defaulters.length === 0) {
        return (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-600 font-medium">🎉 No defaulters! All fees are up to date.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="text-orange-500" size={24} />
                <p className="text-orange-800">
                    <span className="font-semibold">{defaulters.length}</span> student(s) have overdue payments.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Student</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Class</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Overdue Fees</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Total Due</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {defaulters.map((d) => (
                            <tr key={d.studentId} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{d.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-slate-600">{d.class} - {d.section}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {d.fees.map((f, i) => (
                                            <div key={i} className="text-sm">
                                                <span className="text-slate-700">{f.feeHead}</span>
                                                <span className="text-slate-400 ml-2">
                                                    (Due: {new Date(f.dueDate).toLocaleDateString()})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-lg font-bold text-red-600">
                                        ৳{d.totalDue.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {d.phone ? (
                                        <a
                                            href={`tel:${d.phone}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Phone size={14} />
                                            Call
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 text-sm">No phone</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
