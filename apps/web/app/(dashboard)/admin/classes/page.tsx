import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getClasses, getFirstBranch } from './actions';
import ClassTable from './class-table';
import { auth } from '@/lib/auth';

export default async function ClassesPage() {
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    const classes = await getClasses(branchId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Classes & Sections</h1>
                    <p className="text-slate-500">Manage classes and their sections</p>
                </div>
                <Link
                    href="/admin/classes/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Class
                </Link>
            </div>

            {/* Classes Table */}
            <Suspense fallback={<div>Loading...</div>}>
                <ClassTable classes={classes} />
            </Suspense>
        </div>
    );
}
