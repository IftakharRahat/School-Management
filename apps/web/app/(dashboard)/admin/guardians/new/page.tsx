import { getFirstBranch } from '../actions';
import GuardianForm from '../guardian-form';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ returnTo?: string }>;
}

export default async function NewGuardianPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();
    const tenantId = session?.user?.tenantId || 'demo-tenant-id';

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Add New Guardian</h1>
                <p className="text-slate-500">Enter guardian details</p>
            </div>

            <GuardianForm branchId={branchId} tenantId={tenantId} returnTo={params.returnTo} />
        </div>
    );
}
