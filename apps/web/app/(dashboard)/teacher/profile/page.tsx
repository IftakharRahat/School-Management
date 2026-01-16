import { redirect } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, BookOpen, GraduationCap } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format } from 'date-fns';

export default async function TeacherProfilePage() {
    const session = await auth();
    if (!session) redirect('/login');

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id },
        include: {
            user: true,
            branch: true,
            subjectAssignments: {
                include: {
                    subject: {
                        include: { class: true }
                    }
                }
            },
            classTeacherOf: {
                include: { class: true }
            }
        }
    });

    if (!teacher) redirect('/login');

    const user = teacher.user;

    return (
        <div className="p-6 max-w-[900px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Teacher</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Profile</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-blue-600" />
                    My Profile
                </h1>
            </div>

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                        {user.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-blue-100 mt-1">{teacher.designation || 'Teacher'}</p>
                        <p className="text-blue-100">{teacher.department}</p>
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
                        {teacher.dateOfBirth && (
                            <div className="flex items-center gap-3">
                                <Calendar className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Date of Birth</p>
                                    <p className="text-slate-700">{format(new Date(teacher.dateOfBirth), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                        )}
                        {teacher.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Address</p>
                                    <p className="text-slate-700">{teacher.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Professional Info */}
                <div className="bg-white border rounded-xl p-5">
                    <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Professional Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Briefcase className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Employee ID</p>
                                <p className="text-slate-700">{teacher.employeeId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Joining Date</p>
                                <p className="text-slate-700">{format(new Date(teacher.joiningDate), 'MMM d, yyyy')}</p>
                            </div>
                        </div>
                        {teacher.qualification && (
                            <div className="flex items-center gap-3">
                                <GraduationCap className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Qualification</p>
                                    <p className="text-slate-700">{teacher.qualification}</p>
                                </div>
                            </div>
                        )}
                        {teacher.specialization && (
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400">Specialization</p>
                                    <p className="text-slate-700">{teacher.specialization}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Assigned Subjects */}
                {teacher.subjectAssignments.length > 0 && (
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Teaching Subjects</h3>
                        <div className="flex flex-wrap gap-2">
                            {teacher.subjectAssignments.map(sa => (
                                <span key={sa.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {sa.subject.name} ({sa.subject.class.name})
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Class Teacher Of */}
                {teacher.classTeacherOf.length > 0 && (
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Class Teacher Of</h3>
                        <div className="flex flex-wrap gap-2">
                            {teacher.classTeacherOf.map(section => (
                                <span key={section.id} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                    {section.class.name} - Section {section.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
