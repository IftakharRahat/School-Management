'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { value: 9.2, color: '#3b82f6' },
    { value: 0.8, color: '#e2e8f0' },
];

export default function PerformanceChart() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-800">Performance</h2>
                <button className="text-slate-400 hover:text-slate-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </button>
            </div>

            <div className="relative h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="80%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                    <span className="text-4xl font-bold text-slate-800">9.2</span>
                    <span className="text-xs font-medium text-slate-400">of 10 max LTS</span>
                </div>
            </div>

            <div className="text-center mt-4">
                <p className="text-sm font-semibold text-slate-700">1st Semester - 2nd Semester</p>
            </div>
        </div>
    );
}
