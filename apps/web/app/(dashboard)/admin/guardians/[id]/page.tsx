import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Mail, Phone, Calendar, MapPin, User, Briefcase, GraduationCap, Users } from 'lucide-react';
import { getGuardian } from '../actions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewGuardianPage({ params }: PageProps) {
    const { id } = await params;
    const guardian = await getGuardian(id);

    if (!guardian) {
        notFound();
    }

    return (
        <div className="p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/guardians"
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{guardian.user.name}</h1>
                        <p className="text-slate-500">{guardian.occupation || 'Guardian'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/guardians/${id}/students`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                        <Users size={16} />
                        Link Children
                    </Link>
                    <Link
                        href={`/admin/guardians/${id}/edit`}
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
                            <p className="font-medium text-slate-800">{guardian.user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Phone</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" />
                                {guardian.user.phone || '-'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-slate-500 mb-1">Email</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" />
                                {guardian.user.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Occupation</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Briefcase size={14} className="text-slate-400" />
                                {guardian.occupation || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Workplace</p>
                            <p className="font-medium text-slate-800">
                                {guardian.workplace || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Children Information */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <GraduationCap size={20} className="text-green-600" />
                        Children
                    </h2>
                    {guardian.students.length > 0 ? (
                        <div className="space-y-4">
                            {guardian.students.map((sg) => (
                                <Link
                                    key={sg.student.id}
                                    href={`/admin/students/${sg.student.id}`}
                                    className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-slate-800">{sg.student.user.name}</p>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {sg.relation || 'Child'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Admission No: {sg.student.admissionNo}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No children linked yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
