import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getFirstBranch, getSubject, getClassesForSubject } from '../../actions';
import SubjectForm from '../../subject-form';

export default async function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const { id } = await params;
    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const [subject, classes] = await Promise.all([
        getSubject(id),
        getClassesForSubject(branchId),
    ]);

    if (!subject) notFound();

    const initialData = {
        name: subject.name,
        code: subject.code,
        classId: subject.classId,
        creditHours: subject.creditHours,
        isOptional: subject.isOptional,
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Edit Subject</h1>
                <p className="text-slate-500">Update subject details</p>
            </div>

            <SubjectForm
                classes={classes}
                initialData={initialData}
                isEditing
                subjectId={subject.id}
            />
        </div>
    );
}
