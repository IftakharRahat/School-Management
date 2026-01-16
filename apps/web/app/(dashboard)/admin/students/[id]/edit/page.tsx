import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getStudent, getClasses, getGuardians, getFirstBranch } from '../../actions';
import StudentForm from '../../new/student-form';
import { auth } from '@/lib/auth';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();
    const tenantId = session?.user?.tenantId || 'demo-tenant-id';

    if (!branchId) {
        return <div className="p-6">Please set up a branch first.</div>;
    }

    const [student, classes, guardians] = await Promise.all([
        getStudent(id),
        getClasses(branchId),
        getGuardians(branchId),
    ]);

    if (!student) {
        notFound();
    }

    // Get current enrollment
    const currentEnrollment = student.enrollments.find(e => e.status === 'ACTIVE');

    // Transform student data to match form structure
    const nameParts = student.user.name.split(' ');
    const initialData = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: student.user.email,
        phone: student.user.phone,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        address: student.address,
        admissionNo: student.admissionNo,
        admissionDate: student.admissionDate.toISOString().split('T')[0],
        classId: currentEnrollment?.section?.class?.id || '',
        sectionId: currentEnrollment?.sectionId || '',
        guardianId: student.guardians[0]?.guardianId || null,
    };

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Edit Student</h1>
                <p className="text-slate-500">Update student information</p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <StudentForm
                    classes={classes}
                    guardians={guardians}
                    branchId={branchId}
                    tenantId={tenantId}
                    initialData={initialData}
                    isEditing
                    studentId={id}
                />
            </Suspense>
        </div>
    );
}
