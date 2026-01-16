import { auth } from '@/lib/auth';
import { getMonthlyReport, getDefaultersList } from './actions';
import MonthlyReportView from './monthly-report';
import DefaultersView from './defaulters-view';
import FinanceNav from '../finance-nav';

export default async function FeeReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;
    const activeTab = params.tab || 'monthly';

    const now = new Date();
    const monthlyReport = await getMonthlyReport(now.getMonth() + 1, now.getFullYear());
    const defaulters = await getDefaultersList();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-4">
                    <span>Finance</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Reports</span>
                </nav>
                <FinanceNav />
                <h1 className="text-2xl font-bold text-slate-800 mt-4">Fee Reports</h1>
                <p className="text-slate-500 mt-1">View collection summary and defaulters list.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <a
                    href="?tab=monthly"
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'monthly'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Monthly Summary
                </a>
                <a
                    href="?tab=defaulters"
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'defaulters'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Defaulters
                    {defaulters && defaulters.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                            {defaulters.length}
                        </span>
                    )}
                </a>
            </div>

            {/* Content */}
            {activeTab === 'monthly' && <MonthlyReportView initialReport={monthlyReport} />}
            {activeTab === 'defaulters' && <DefaultersView defaulters={defaulters || []} />}
        </div>
    );
}
