import { Suspense } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { getTeachers, getDepartments, getFirstBranch } from './actions';
import TeacherTable from './teacher-table';
import { auth } from '@/lib/auth';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        department?: string;
    }>;
}

export default async function TeachersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const search = params.search || '';
    const department = params.department || '';

    // Get branchId from session or fallback
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    // Handle case where no branch is found
    if (!branchId) {
        return (
            <div className="p-6 text-center text-slate-500">
                No branch found. Please set up a branch first.
            </div>
        );
    }

    const [teachersData, departments] = await Promise.all([
        getTeachers({ page, search, department, branchId }),
        getDepartments(),
    ]);

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
                    <p className="text-slate-500">Manage teaching staff and their assignments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        Export
                    </button>
                    <Link
                        href="/admin/teachers/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Teacher
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <form className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name, employee ID, or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                        />
                    </div>

                    <select
                        name="department"
                        defaultValue={department}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-600 min-w-[150px]"
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Total Teachers</p>
                    <p className="text-2xl font-bold text-slate-800">{teachersData.pagination.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{teachersData.pagination.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">On Leave</p>
                    <p className="text-2xl font-bold text-amber-600">0</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Departments</p>
                    <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
                </div>
            </div>

            {/* Teacher Table */}
            <Suspense fallback={<div className="bg-white rounded-2xl p-8 text-center">Loading...</div>}>
                <TeacherTable
                    teachers={teachersData.teachers}
                    pagination={teachersData.pagination}
                />
            </Suspense>
        </div>
    );
}
