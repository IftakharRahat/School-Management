import { notFound } from 'next/navigation';
import { getGuardian, getFirstBranch } from '../../actions';
import GuardianForm from '../../guardian-form';
import { auth } from '@/lib/auth';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditGuardianPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();
    const tenantId = session?.user?.tenantId || 'demo-tenant-id';

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    const guardian = await getGuardian(id);

    if (!guardian) {
        notFound();
    }

    const nameParts = guardian.user.name.split(' ');
    const initialData = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: guardian.user.email,
        phone: guardian.user.phone || '',
        occupation: guardian.occupation,
        workplace: guardian.workplace,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Guardian</h1>
                <p className="text-slate-500">Update guardian information</p>
            </div>

            <GuardianForm
                branchId={branchId}
                tenantId={tenantId}
                initialData={initialData}
                isEditing
                guardianId={id}
            />
        </div>
    );
}
