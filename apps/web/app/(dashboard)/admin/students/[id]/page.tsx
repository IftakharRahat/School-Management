import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Mail, Phone, Calendar, MapPin, User, GraduationCap, Users, CreditCard } from 'lucide-react';
import { getStudent } from '../actions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewStudentPage({ params }: PageProps) {
    const { id } = await params;
    const student = await getStudent(id);

    if (!student) {
        notFound();
    }

    // Get current enrollment
    const currentEnrollment = student.enrollments.find(e => e.status === 'ACTIVE');
    const primaryGuardian = student.guardians.find(g => g.isPrimary) || student.guardians[0];

    return (
        <div className="p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/students"
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{student.user.name}</h1>
                        <p className="text-slate-500">Admission No: {student.admissionNo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/students/${id}/id-card`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                        <CreditCard size={16} />
                        ID Card
                    </Link>
                    <Link
                        href={`/admin/students/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Pencil size={16} />
                        Edit
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Full Name</p>
                            <p className="font-medium text-slate-800">{student.user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Gender</p>
                            <p className="font-medium text-slate-800">{student.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400" />
                                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Blood Group</p>
                            <p className="font-medium text-slate-800">{student.bloodGroup || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Email</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" />
                                {student.user.email || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Phone</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" />
                                {student.user.phone || '-'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-slate-500 mb-1">Address</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" />
                                {student.address || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <GraduationCap size={20} className="text-green-600" />
                        Academic Info
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Admission No</p>
                            <p className="font-medium text-slate-800">{student.admissionNo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Admission Date</p>
                            <p className="font-medium text-slate-800">
                                {new Date(student.admissionDate).toLocaleDateString()}
                            </p>
                        </div>
                        {currentEnrollment && (
                            <>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Class</p>
                                    <p className="font-medium text-slate-800">
                                        {currentEnrollment.section?.class?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Section</p>
                                    <p className="font-medium text-slate-800">
                                        Section {currentEnrollment.section?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Roll Number</p>
                                    <p className="font-medium text-slate-800">
                                        {currentEnrollment.rollNumber || '-'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Guardian Information */}
                <div className="md:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-purple-600" />
                        Guardian Information
                    </h2>
                    {student.guardians.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {student.guardians.map((sg) => (
                                <div
                                    key={sg.id}
                                    className={`p-4 rounded-xl border ${sg.isPrimary ? 'border-purple-200 bg-purple-50/50' : 'border-slate-100'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-slate-800">{sg.guardian.user.name}</p>
                                        {sg.isPrimary && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 capitalize">{sg.relation.toLowerCase()}</p>
                                    <div className="mt-3 space-y-1">
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <Phone size={12} />
                                            {sg.guardian.user.phone || '-'}
                                        </p>
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <Mail size={12} />
                                            {sg.guardian.user.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No guardians linked to this student</p>
                    )}
                </div>
            </div>
        </div>
    );
}
