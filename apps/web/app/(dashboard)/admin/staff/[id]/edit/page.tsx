import { redirect, notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../../actions';
import StaffForm from '../../staff-form';

async function getStaff(id: string) {
    const staff = await prisma.staff.findUnique({
        where: { id },
        include: { user: true },
    });
    return staff;
}

export default async function EditStaffPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const staff = await getStaff(params.id);
    if (!staff) notFound();

    // Transform to form data structure
    const initialData = {
        firstName: staff.user.name?.split(' ')[0] || '',
        lastName: staff.user.name?.split(' ').slice(1).join(' ') || '',
        email: staff.user.email || '',
        phone: staff.user.phone || '',
        employeeId: staff.employeeId,
        designation: staff.designation,
        department: staff.department,
        joiningDate: staff.joiningDate.toISOString(),
        salary: staff.salary,
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Edit Staff Member</h1>
                <p className="text-slate-500">Update staff details and employment information</p>
            </div>

            <StaffForm
                branchId={branchId}
                tenantId={session.user.tenantId || ''}
                initialData={initialData}
                isEditing
                staffId={staff.id}
            />
        </div>
    );
}
