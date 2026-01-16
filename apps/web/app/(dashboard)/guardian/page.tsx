import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import {
    GraduationCap, Calendar, FileText, CheckCircle,
    BookOpen, Clock, User, Bell
} from 'lucide-react';

async function getGuardianData(userId: string) {
    const guardian = await prisma.guardian.findUnique({
        where: { userId },
        include: {
            user: true,
            students: {
                include: {
                    student: {
                        include: {
                            user: true,
                            enrollments: {
                                where: { status: 'ACTIVE' },
                                include: {
                                    section: {
                                        include: { class: true },
                                    },
                                },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    });
    return guardian;
}

export default async function GuardianDashboardPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    // Redirect non-guardians
    if (session.user.role !== 'GUARDIAN') {
        redirect('/admin');
    }

    const guardian = await getGuardianData(session.user.id);
    if (!guardian) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Guardian profile not found. Please contact support.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome, {guardian.user.name}!
                </h1>
                <p className="text-white/80">
                    Monitor your children&apos;s academic progress and stay connected with the school.
                </p>
            </div>

            {/* Children Cards */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Your Children</h2>
                {guardian.students.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                        <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">No children linked to your account yet.</p>
                        <p className="text-sm text-slate-400">Please contact the school administration.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guardian.students.map((sg) => {
                            const enrollment = sg.student.enrollments[0];
                            return (
                                <div
                                    key={sg.student.id}
                                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                                            {sg.student.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{sg.student.user.name}</h3>
                                            <p className="text-sm text-slate-500">
                                                {enrollment ? `${enrollment.section.class.name} - Section ${enrollment.section.name}` : 'Not enrolled'}
                                            </p>
                                            <p className="text-xs text-slate-400 capitalize">
                                                ({sg.relation.toLowerCase()})
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-green-50 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-green-600">95%</p>
                                            <p className="text-xs text-green-600">Attendance</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-blue-600">A</p>
                                            <p className="text-xs text-blue-600">Grade</p>
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="space-y-2">
                                        <Link
                                            href={`/guardian/children/${sg.student.id}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <User size={14} />
                                            View Profile
                                        </Link>
                                        <Link
                                            href={`/guardian/children/${sg.student.id}/attendance`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <Calendar size={14} />
                                            Attendance
                                        </Link>
                                        <Link
                                            href={`/guardian/children/${sg.student.id}/results`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <FileText size={14} />
                                            Results
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    href="/guardian/attendance"
                    className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-medium text-slate-800">Attendance</p>
                    <p className="text-xs text-slate-500">View records</p>
                </Link>
                <Link
                    href="/guardian/timetable"
                    className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-800">Timetable</p>
                    <p className="text-xs text-slate-500">Class schedule</p>
                </Link>
                <Link
                    href="/guardian/results"
                    className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-medium text-slate-800">Results</p>
                    <p className="text-xs text-slate-500">Exam scores</p>
                </Link>
                <Link
                    href="/guardian/announcements"
                    className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="font-medium text-slate-800">Announcements</p>
                    <p className="text-xs text-slate-500">School updates</p>
                </Link>
            </div>
        </div>
    );
}
