import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getGuardian, getFirstBranch, getGuardianStudents, getAvailableStudents } from '../../actions';
import StudentLinkingForm from './student-linking-form';

export default async function GuardianStudentsPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const [guardian, linkedStudents, availableStudents] = await Promise.all([
        getGuardian(params.id),
        getGuardianStudents(params.id),
        getAvailableStudents(branchId, params.id),
    ]);

    if (!guardian) notFound();

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={`/admin/guardians/${params.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Guardian Profile
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    Link Students - {guardian.user.name}
                </h1>
                <p className="text-slate-500">Manage students linked to this guardian</p>
            </div>

            <StudentLinkingForm
                guardianId={params.id}
                linkedStudents={linkedStudents}
                availableStudents={availableStudents}
            />
        </div>
    );
}
