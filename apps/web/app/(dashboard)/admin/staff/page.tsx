import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getStaffs, getFirstBranch } from './actions';
import StaffTable from './staff-table';

export default async function StaffPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string }
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || '';

    const { staffs, pagination } = await getStaffs({
        page,
        search,
        branchId,
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                    <p className="text-slate-500">Manage non-teaching staff, roles, and profiles</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        Export
                    </button>
                    <Link
                        href="/admin/staff/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus size={18} />
                        Add Staff
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <form action="">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name, email, or employee ID..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </form>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* List */}
            <Suspense fallback={<div>Loading...</div>}>
                <StaffTable staffs={staffs} pagination={pagination} />
            </Suspense>
        </div>
    );
}
