import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../actions';
import { getClassesWithSections } from './actions';
import ImportForm from './import-form';

export default async function ImportStudentsPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const classes = await getClassesWithSections(branchId);

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/admin/students"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Students
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Bulk Import Students</h1>
                <p className="text-slate-500">Import multiple students from a CSV file</p>
            </div>

            <ImportForm
                branchId={branchId}
                tenantId={session.user.tenantId || ''}
                classes={classes}
            />
        </div>
    );
}
