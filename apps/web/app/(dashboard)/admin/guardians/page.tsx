import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { getGuardians, getFirstBranch } from './actions';
import GuardianTable from './guardian-table';
import { auth } from '@/lib/auth';

interface PageProps {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function GuardiansPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    const page = parseInt(params.page || '1', 10);
    const search = params.search || '';

    const { guardians, pagination } = await getGuardians({
        page,
        search,
        branchId,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Guardians</h1>
                    <p className="text-slate-500">Manage student guardians and parents</p>
                </div>
                <Link
                    href="/admin/guardians/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Guardian
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <form className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Table */}
            <Suspense fallback={<div>Loading...</div>}>
                <GuardianTable
                    guardians={guardians.map(g => ({
                        id: g.id,
                        occupation: g.occupation,
                        workplace: g.workplace,
                        user: {
                            name: g.user.name,
                            email: g.user.email,
                            phone: g.user.phone,
                        },
                        students: g.students.map(s => ({
                            student: {
                                user: {
                                    name: s.student.user.name
                                }
                            }
                        }))
                    }))}
                    pagination={pagination}
                />
            </Suspense>
        </div>
    );
}
