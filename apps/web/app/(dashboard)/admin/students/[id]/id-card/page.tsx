import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import StudentIDCard from './id-card';

async function getStudent(id: string) {
    return prisma.student.findUnique({
        where: { id },
        include: {
            user: true,
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: {
                            class: true,
                        },
                    },
                },
                take: 1,
            },
        },
    });
}

export default async function StudentIDCardPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const student = await getStudent(params.id);
    if (!student) notFound();

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href={`/admin/students/${params.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Student Profile
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Student ID Card</h1>
                <p className="text-slate-500">Generate and print student ID card</p>
            </div>

            <StudentIDCard student={student} />
        </div>
    );
}
