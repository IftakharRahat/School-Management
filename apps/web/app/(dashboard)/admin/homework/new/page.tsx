import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { getFirstBranch, getClassesForHomework, getTeachersForAssignment } from '../actions';
import HomeworkForm from '../homework-form';

async function getTeacherId(userId: string) {
    const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
    });
    return teacher?.id;
}

export default async function NewHomeworkPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const [classes, teacherId, teachers] = await Promise.all([
        getClassesForHomework(branchId),
        getTeacherId(session.user.id),
        getTeachersForAssignment(branchId),
    ]);

    // If user is a teacher, use their ID. If not (e.g. admin), pass null so they must select.
    const currentTeacherId = teacherId || null;

    return (
        <div className="p-6 max-w-3xl">
            <div className="mb-6">
                <Link
                    href="/admin/homework"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Homework
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Create Homework</h1>
                <p className="text-slate-500">Assign a new homework to a class</p>
            </div>

            <HomeworkForm
                classes={classes}
                teacherId={currentTeacherId}
                teachers={teachers}
            />
        </div>
    );
}
