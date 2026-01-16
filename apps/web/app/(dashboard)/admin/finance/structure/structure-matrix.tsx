'use client';

import { useState } from 'react';
import { Save, Loader2, DollarSign } from 'lucide-react';
import { saveFeeStructure } from './actions';
import { useRouter } from 'next/navigation';

type Prop = {
    classes: any[];
    feeHeads: any[];
    structures: any[];
};

export default function FeeStructureMatrix({ classes, feeHeads, structures }: Prop) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const getAmount = (classId: string, feeHeadId: string) => {
        const struct = structures.find(s => s.classId === classId && s.feeHeadId === feeHeadId);
        return struct?.amount?.toString() || '';
    };

    const handleAmountChange = async (classId: string, feeHeadId: string, value: string) => {
        const amount = parseFloat(value);
        if (isNaN(amount) && value !== '') return;

        // Optimistic update could go here, but for now we wait for blur to save
    };

    const handleSave = async (classId: string, feeHeadId: string, value: string) => {
        const amount = parseFloat(value);
        if (isNaN(amount)) return; // Ignore invalid

        const key = `${classId}-${feeHeadId}`;
        setLoadingMap(prev => ({ ...prev, [key]: true }));

        const result = await saveFeeStructure(classId, feeHeadId, amount);

        setLoadingMap(prev => ({ ...prev, [key]: false }));
        if (result?.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                                Class
                            </th>
                            {feeHeads.map(head => (
                                <th key={head.id} className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[150px]">
                                    <div>{head.name}</div>
                                    <div className="text-[10px] text-slate-400 font-normal normal-case mt-1">{head.frequency}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {classes.map(cls => (
                            <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 sticky left-0 bg-white border-r border-slate-200 z-10 group-hover:bg-slate-50">
                                    {cls.name}
                                </td>
                                {feeHeads.map(head => {
                                    const key = `${cls.id}-${head.id}`;
                                    const isLoading = loadingMap[key];
                                    const currentAmount = getAmount(cls.id, head.id);

                                    return (
                                        <td key={head.id} className="px-6 py-3 whitespace-nowrap">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-slate-400 sm:text-sm">৳</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    defaultValue={currentAmount}
                                                    onBlur={(e) => handleSave(cls.id, head.id, e.target.value)}
                                                    className="block w-full pl-8 pr-10 sm:text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    {isLoading ? (
                                                        <Loader2 className="animate-spin text-blue-500" size={14} />
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            {/* Could show a checkmark on saved */}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {classes.length === 0 && (
                            <tr>
                                <td colSpan={feeHeads.length + 1} className="px-6 py-12 text-center text-slate-500">
                                    No classes found. Please create classes first.
                                </td>
                            </tr>
                        )}
                        {feeHeads.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                                    No Fee Heads found. Please configuration Fee Heads first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
