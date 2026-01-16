import { Suspense } from 'react';
import { getDepartments, getFirstBranch } from '../actions';
import TeacherForm from '../teacher-form';
import { auth } from '@/lib/auth';

export default async function NewTeacherPage() {
    const departments = await getDepartments();
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    const tenantId = session?.user?.tenantId || 'demo-tenant-id'; // Fallback for dev

    if (!branchId) {
        return <div>Please set up a branch first.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Add New Teacher</h1>
                <p className="text-slate-500">Create a new teacher profile</p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <TeacherForm departments={departments} branchId={branchId} tenantId={tenantId} />
            </Suspense>
        </div>
    );
}
