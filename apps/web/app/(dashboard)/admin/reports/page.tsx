import { redirect } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { auth } from '@/lib/auth';
import FeeSummary from './fee-summary';
import AttendanceStats from './attendance-stats';
import ReportCardGenerator from './report-card-generator';

export default async function ReportsPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    return (
        <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Reports</span>
                </nav>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="text-blue-600" />
                            Reports & Analytics
                        </h1>
                        <p className="text-slate-500 mt-1">Detailed insights and printable reports.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border p-6">
                    <FeeSummary />
                </div>
                <div className="bg-white rounded-xl border p-6">
                    <AttendanceStats />
                </div>
            </div>

            <div className="mb-6">
                <ReportCardGenerator />
            </div>
        </div>
    );
}
