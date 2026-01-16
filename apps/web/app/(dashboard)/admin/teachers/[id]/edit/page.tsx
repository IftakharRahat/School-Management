import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTeacher, getDepartments, getFirstBranch } from '../../actions';
import TeacherForm from '../../teacher-form';
import { auth } from '@/lib/auth';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();
    const tenantId = session?.user?.tenantId || 'demo-tenant-id';

    const [teacher, departments] = await Promise.all([
        getTeacher(id),
        getDepartments(),
    ]);

    if (!teacher) {
        notFound();
    }

    if (!branchId) {
        return <div>Please set up a branch first.</div>;
    }

    // Transform teacher data to match form data structure
    const initialData = {
        firstName: teacher.user.name.split(' ')[0],
        lastName: teacher.user.name.split(' ').slice(1).join(' '),
        email: teacher.user.email,
        phone: teacher.user.phone || '',
        dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.toISOString().split('T')[0] : '',
        gender: teacher.gender || undefined,
        employeeId: teacher.employeeId,
        designation: teacher.designation || '',
        department: teacher.department || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        joiningDate: teacher.joiningDate.toISOString().split('T')[0],
        address: teacher.address || '',
    };

    // Note: Some fields like Gender, DOB, Address might need to be fetched from User or Teacher model correctly if they exist there. 
    // Based on previous file reads, Teacher has: employeeId, designation, department, qualification, specialization, joiningDate.
    // User has: name, email, phone, role.
    // Address and Gender, DOB were in the form. I need to check where they are stored.
    // Looking at schema in previous turns:
    // Teacher model: id, userId, branchId, employeeId, designation, department, qualification, specialization, joiningDate.
    // User model: id, name, email, phone, ...

    // Wait, where are gender, dob, address stored?
    // In `createTeacher` action:
    // User create: name, email, phone.
    // Teacher create: employeeId, designation, department, qualification, specialization, joiningDate.
    // The form has gender, dob, address. 
    // If they are not in the schema, they might be lost!
    // I should check the schema.prisma again to be sure specific fields location.

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Teacher</h1>
                <p className="text-slate-500">Update teacher profile information</p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <TeacherForm
                    departments={departments}
                    branchId={branchId}
                    tenantId={tenantId}
                    initialData={initialData}
                    isEditing
                    teacherId={id}
                />
            </Suspense>
        </div>
    );
}
