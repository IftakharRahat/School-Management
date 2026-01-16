import { auth } from '@/lib/auth';
import { getAdmissionApplications } from '../../../admission/actions';
import ApplicationList from './application-list';
import { Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function AdminAdmissionsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;
    const status = params.status || 'ALL';

    const applications = await getAdmissionApplications(status);

    const statusCounts = {
        ALL: applications.length,
        PENDING: applications.filter(a => a.status === 'PENDING').length,
        UNDER_REVIEW: applications.filter(a => a.status === 'UNDER_REVIEW').length,
        APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Admissions</span>
                </nav>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Users className="text-blue-600" />
                            Admission Applications
                        </h1>
                        <p className="text-slate-500 mt-1">Review and manage student admission applications.</p>
                    </div>
                    <Link
                        href="/admission"
                        target="_blank"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                        <ExternalLink size={16} />
                        View Public Form
                    </Link>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {[
                    { key: 'ALL', label: 'All' },
                    { key: 'PENDING', label: 'Pending' },
                    { key: 'UNDER_REVIEW', label: 'Under Review' },
                    { key: 'APPROVED', label: 'Approved' },
                ].map((tab) => (
                    <Link
                        key={tab.key}
                        href={`?status=${tab.key}`}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${status === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                            {statusCounts[tab.key as keyof typeof statusCounts] || 0}
                        </span>
                    </Link>
                ))}
            </div>

            <ApplicationList applications={applications as any} />
        </div>
    );
}
