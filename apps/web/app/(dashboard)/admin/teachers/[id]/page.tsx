import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTeacher } from '../actions';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../actions';
import Link from 'next/link';
import { Edit, ArrowLeft, BookOpen } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewTeacherPage({ params }: PageProps) {
    const { id } = await params;
    const teacher = await getTeacher(id);

    if (!teacher) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Teacher Details</h1>
                    <p className="text-slate-500">View teacher profile information</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/teachers"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </Link>
                    <Link
                        href={`/admin/teachers/${id}/subjects`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <BookOpen size={18} />
                        Subjects
                    </Link>
                    <Link
                        href={`/admin/teachers/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        <Edit size={18} />
                        Edit
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">First Name</p>
                                <p className="font-medium text-slate-800">{teacher.user.name.split(' ')[0]}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Last Name</p>
                                <p className="font-medium text-slate-800">{teacher.user.name.split(' ').slice(1).join(' ')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Email</p>
                                <p className="font-medium text-slate-800">{teacher.user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Phone</p>
                                <p className="font-medium text-slate-800">{teacher.user.phone || '—'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Professional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Employee ID</p>
                                <p className="font-medium text-slate-800">{teacher.employeeId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Designation</p>
                                <p className="font-medium text-slate-800">{teacher.designation}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Department</p>
                                <p className="font-medium text-slate-800">{teacher.department || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Joining Date</p>
                                <p className="font-medium text-slate-800">{new Date(teacher.joiningDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Academic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Qualification</p>
                                <p className="font-medium text-slate-800">{teacher.qualification || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Specialization</p>
                                <p className="font-medium text-slate-800">{teacher.specialization || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
