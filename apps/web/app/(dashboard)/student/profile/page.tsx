import { redirect } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Hash } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';

export default async function StudentProfilePage() {
    const session = await auth();
    if (!session) redirect('/login');

    const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        include: {
            user: true,
            branch: true,
            enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                    section: {
                        include: { class: true }
                    },
                    academicYear: true
                }
            },
            guardians: {
                include: {
                    guardian: {
                        include: { user: true }
                    }
                }
            }
        }
    });

    if (!student) redirect('/login');

    const enrollment = student.enrollments[0];
    const user = student.user;

    return (
        <div className="p-6 max-w-[900px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Student</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Profile</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-blue-600" />
                    My Profile
                </h1>
            </div>

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                        {user.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-blue-100 mt-1">{student.admissionNo}</p>
                        {enrollment && (
                            <p className="text-blue-100 mt-1">
                                {enrollment.section.class.name} - Section {enrollment.section.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Info */}
                <div className="bg-white border rounded-xl p-5">
                    <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Personal Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Email</p>
                                <p className="text-slate-700">{user.email}</p>
                            </div>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Phone</p>
                                    <p className="text-slate-700">{user.phone}</p>
                                </div>
                            </div>
                        )}
                        {student.dateOfBirth && (
                            <div className="flex items-center gap-3">
                                <Calendar className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Date of Birth</p>
                                    <p className="text-slate-700">{format(new Date(student.dateOfBirth), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                        )}
                        {student.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Address</p>
                                    <p className="text-slate-700">{student.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Academic Info */}
                <div className="bg-white border rounded-xl p-5">
                    <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Academic Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Hash className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Admission No</p>
                                <p className="text-slate-700">{student.admissionNo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Admission Date</p>
                                <p className="text-slate-700">{format(new Date(student.admissionDate), 'MMM d, yyyy')}</p>
                            </div>
                        </div>
                        {enrollment && (
                            <>
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-400">Class & Section</p>
                                        <p className="text-slate-700">{enrollment.section.class.name} - {enrollment.section.name}</p>
                                    </div>
                                </div>
                                {enrollment.rollNumber && (
                                    <div className="flex items-center gap-3">
                                        <Hash className="text-slate-400" size={18} />
                                        <div>
                                            <p className="text-xs text-slate-400">Roll Number</p>
                                            <p className="text-slate-700">{enrollment.rollNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Guardian Info */}
                {student.guardians.length > 0 && (
                    <div className="bg-white border rounded-xl p-5 md:col-span-2">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Guardian Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {student.guardians.map(sg => (
                                <div key={sg.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {sg.guardian.user.name?.charAt(0) || 'G'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{sg.guardian.user.name}</p>
                                        <p className="text-sm text-slate-500">{sg.relation}</p>
                                        {sg.guardian.user.phone && (
                                            <p className="text-sm text-slate-500">{sg.guardian.user.phone}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
