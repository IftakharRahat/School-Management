import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getFirstBranch, getClassesForSubject } from '../actions';
import SubjectForm from '../subject-form';

export default async function NewSubjectPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const classes = await getClassesForSubject(branchId);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Add Subject</h1>
                <p className="text-slate-500">Create a new subject for a class</p>
            </div>

            <SubjectForm classes={classes} />
        </div>
    );
}
