import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import {
    getTeachersForDropdown,
    getAvailableStudentsForEnrollment,
    getCurrentAcademicYear,
    getFirstBranch
} from '../../classes/actions';
import SectionManagement from './section-management';

async function getSectionWithTeacher(sectionId: string) {
    return prisma.section.findUnique({
        where: { id: sectionId },
        include: {
            class: true,
            classTeacher: {
                include: { user: true },
            },
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    student: {
                        include: { user: true },
                    },
                },
            },
        },
    });
}

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const { id } = await params;
    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const [section, teachers, availableStudents, academicYear] = await Promise.all([
        getSectionWithTeacher(id),
        getTeachersForDropdown(branchId),
        getAvailableStudentsForEnrollment(branchId),
        getCurrentAcademicYear(branchId),
    ]);

    if (!section) notFound();

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/admin/classes"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Classes
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    {section.class.name} - Section {section.name}
                </h1>
                <p className="text-slate-500">Manage class teacher and student enrollment</p>
            </div>

            <SectionManagement
                section={section}
                teachers={teachers}
                availableStudents={availableStudents}
                academicYearId={academicYear?.id || ''}
            />
        </div>
    );
}
