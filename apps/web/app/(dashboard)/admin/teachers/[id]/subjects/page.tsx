import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import {
    getFirstBranch,
    getTeacherSubjects,
    getAvailableSubjects
} from '../../actions';
import SubjectAssignmentForm from './subject-assignment-form';

async function getTeacher(id: string) {
    return prisma.teacher.findUnique({
        where: { id },
        include: { user: true },
    });
}

export default async function TeacherSubjectsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const { id } = await params;
    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const [teacher, assignedSubjects, availableSubjects] = await Promise.all([
        getTeacher(id),
        getTeacherSubjects(id),
        getAvailableSubjects(branchId),
    ]);

    if (!teacher) notFound();

    // Filter out already assigned subjects from available list
    const assignedIds = new Set(assignedSubjects.map(a => a.subjectId));
    const unassignedSubjects = availableSubjects.filter(s => !assignedIds.has(s.id));

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/admin/teachers/${id}`}
                    className="text-blue-600 hover:underline text-sm mb-2 inline-block"
                >
                    ← Back to Teacher Profile
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    Subject Assignments - {teacher.user.name}
                </h1>
                <p className="text-slate-500">Manage subjects assigned to this teacher</p>
            </div>

            {/* Assignment Form */}
            <SubjectAssignmentForm
                teacherId={id}
                assignedSubjects={assignedSubjects}
                availableSubjects={unassignedSubjects}
            />
        </div>
    );
}
