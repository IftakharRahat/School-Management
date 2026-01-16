import { getFirstBranch } from '../actions';
import ClassForm from '../class-form';
import { auth } from '@/lib/auth';

export default async function NewClassPage() {
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Add New Class</h1>
                <p className="text-slate-500">Create a new class with sections</p>
            </div>

            <ClassForm branchId={branchId} />
        </div>
    );
}
