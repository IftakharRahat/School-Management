import { auth } from '@/lib/auth';
import { getMonthlyFeeStats } from './actions';
import FeeCollector from './fee-collector';
import { DollarSign, TrendingUp } from 'lucide-react';
import FinanceNav from '../finance-nav';

export default async function FeeCollectPage() {
    const session = await auth();
    const stats = await getMonthlyFeeStats();

    const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-4">
                    <span>Finance</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Collect Fees</span>
                </nav>
                <FinanceNav />
                <h1 className="text-2xl font-bold text-slate-800 mt-4">Fee Collection</h1>
                <p className="text-slate-500 mt-1">Search for students and collect their pending fees.</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{monthName} - Total Due</p>
                                <p className="text-2xl font-bold text-slate-800">৳{stats.totalDue.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <DollarSign className="text-orange-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{monthName} - Collected</p>
                                <p className="text-2xl font-bold text-green-600">৳{stats.totalCollected.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FeeCollector />
        </div>
    );
}
