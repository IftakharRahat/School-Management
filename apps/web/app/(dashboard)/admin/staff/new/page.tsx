import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../actions';
import StaffForm from '../staff-form';

export const dynamic = 'force-dynamic';

export default async function NewStaffPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Add Staff Member</h1>
                <p className="text-slate-500">Create a new non-teaching staff profile</p>
            </div>

            <StaffForm
                branchId={branchId}
                tenantId={session.user.tenantId || ''}
            />
        </div>
    );
}
