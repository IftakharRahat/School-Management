import { notFound } from 'next/navigation';
import { getClass, getFirstBranch } from '../../actions';
import ClassForm from '../../class-form';
import { auth } from '@/lib/auth';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    const classItem = await getClass(id);

    if (!classItem) {
        notFound();
    }

    const initialData = {
        id: classItem.id,
        name: classItem.name,
        grade: classItem.grade,
        sections: classItem.sections.map((s) => ({
            id: s.id,
            name: s.name,
            capacity: s.capacity,
        })),
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Class</h1>
                <p className="text-slate-500">Update class and section details</p>
            </div>

            <ClassForm branchId={branchId} initialData={initialData} isEditing />
        </div>
    );
}
