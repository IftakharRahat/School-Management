import { getClasses, getGuardians, getFirstBranch } from '../actions';
import StudentForm from './student-form';
import { auth } from '@/lib/auth';

export default async function NewStudentPage() {
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();
    const tenantId = session?.user?.tenantId || 'demo-tenant-id';

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    const [classes, guardians] = await Promise.all([
        getClasses(branchId),
        getGuardians(branchId),
    ]);

    return (
        <div className="p-6 max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Add New Student</h1>
                <p className="text-slate-500">Enter student details and enrollment information</p>
            </div>

            {/* Form */}
            <StudentForm
                classes={classes}
                guardians={guardians.map(g => ({
                    id: g.id,
                    user: {
                        name: g.user.name,
                        phone: g.user.phone
                    }
                }))}
                branchId={branchId}
                tenantId={tenantId}
            />
        </div>
    );
}

