'use client';

import { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingDown } from 'lucide-react';
import { getAttendanceAnalytics } from './actions';

export default function AttendanceStats() {
    const [data, setData] = useState<any>({ today: [], lowAttendance: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const result = await getAttendanceAnalytics();
        setData(result);
        setLoading(false);
    }

    if (loading) return <div className="text-sm text-slate-400 py-4">Loading attendance data...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Users className="text-purple-600" size={20} />
                    Today's Attendance by Class
                </h3>
                <div className="space-y-3">
                    {data.today.map((item: any) => (
                        <div key={item.className}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">{item.className}</span>
                                <span className={item.percentage < 70 ? 'text-red-600' : 'text-slate-600'}>{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${item.percentage >= 90 ? 'bg-emerald-500' :
                                            item.percentage >= 75 ? 'bg-blue-500' :
                                                'bg-red-500'
                                        }`}
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {data.today.length === 0 && (
                        <div className="text-sm text-slate-500 italic">No attendance marked for today yet.</div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-amber-500" size={20} />
                    Low Attendance Alert (Month)
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-red-100/50 text-red-900">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium">Student</th>
                                <th className="px-3 py-2 text-left font-medium">Class</th>
                                <th className="px-3 py-2 text-right font-medium">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                            {data.lowAttendance.map((student: any) => (
                                <tr key={student.admissionNo}>
                                    <td className="px-3 py-2 text-slate-700 font-medium">
                                        {student.name}
                                        <div className="text-[10px] text-slate-400">#{student.admissionNo}</div>
                                    </td>
                                    <td className="px-3 py-2 text-slate-600">{student.class}</td>
                                    <td className="px-3 py-2 text-right text-red-600 font-bold">{student.percentage}%</td>
                                </tr>
                            ))}
                            {data.lowAttendance.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-3 py-4 text-center text-slate-500 italic">
                                        No students with low attendance! 🎉
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
