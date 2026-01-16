import { auth } from '@/lib/auth';
import { getFeeStructures } from './actions';
import FeeStructureMatrix from './structure-matrix';
import { AlertCircle } from 'lucide-react';
import FinanceNav from '../finance-nav';

export default async function FeeStructurePage() {
    const session = await auth();
    const data = await getFeeStructures();

    return (
        <div className="p-6 max-w-[95%] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-4">
                    <span>Finance</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Fee Structure</span>
                </nav>
                <FinanceNav />
                <div className="flex justify-between items-end mt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Fee Structure Mapping</h1>
                        <p className="text-slate-500 mt-1">Set fee amounts for each class and fee type.</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-medium">Instructions:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Enter the amount for each fee head corresponding to the class.</li>
                        <li>Changes are saved automatically when you click outside the input field.</li>
                        <li>Leave as 0 if the fee does not apply to a specific class.</li>
                    </ul>
                </div>
            </div>

            <FeeStructureMatrix
                classes={data.classes}
                feeHeads={data.feeHeads}
                structures={data.structures}
            />
        </div>
    );
}
