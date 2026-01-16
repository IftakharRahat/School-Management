'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { getFeeStats } from './actions';

export default function FeeSummary() {
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    const [stats, setStats] = useState<any>({ total: 0, count: 0, byMethod: [], daily: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [dateRange]);

    async function loadStats() {
        setLoading(true);
        const data = await getFeeStats(new Date(dateRange.start), new Date(dateRange.end));
        setStats(data);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Wallet className="text-blue-600" size={20} />
                    Fee Collection
                </h3>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        className="text-sm border rounded px-2 py-1"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        className="text-sm border rounded px-2 py-1"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-slate-400">Loading stats...</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="text-xs text-emerald-600 font-medium mb-1">Total Collected</div>
                            <div className="text-2xl font-bold text-emerald-700">৳{stats.total.toLocaleString()}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-xs text-blue-600 font-medium mb-1">Transactions</div>
                            <div className="text-2xl font-bold text-blue-700">{stats.count}</div>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-600 font-medium mb-2">Payment Methods</div>
                            <div className="flex gap-4 text-sm">
                                {stats.byMethod.map((m: any) => (
                                    <div key={m.name} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <span className="text-slate-500 capitalize">{m.name.toLowerCase().replace('_', ' ')}:</span>
                                        <span className="font-semibold text-slate-700">৳{m.value.toLocaleString()}</span>
                                    </div>
                                ))}
                                {stats.byMethod.length === 0 && <span className="text-slate-400">No data</span>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-4 h-[300px]">
                        <h4 className="text-sm font-medium text-slate-500 mb-4">Daily Collection Trend</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.daily}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    fontSize={12}
                                    tickFormatter={(str) => format(new Date(str), 'd MMM')}
                                    minTickGap={30}
                                />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Amount']}
                                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
