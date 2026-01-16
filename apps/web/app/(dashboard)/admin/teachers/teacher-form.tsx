'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createTeacher, updateTeacher, type TeacherFormData } from './actions';

interface TeacherFormProps {
    departments: string[];
    branchId: string;
    tenantId: string;
    initialData?: Partial<TeacherFormData>;
    isEditing?: boolean;
    teacherId?: string;
}

export default function TeacherForm({ departments, branchId, tenantId, initialData, isEditing = false, teacherId }: TeacherFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const data: TeacherFormData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || null,
            dateOfBirth: formData.get('dateOfBirth') as string || null,
            gender: formData.get('gender') as 'MALE' | 'FEMALE' | 'OTHER',
            address: formData.get('address') as string || null,
            employeeId: formData.get('employeeId') as string,
            designation: formData.get('designation') as string,
            department: formData.get('department') as string || null,
            qualification: formData.get('qualification') as string || null,
            specialization: formData.get('specialization') as string || null,
            joiningDate: formData.get('joiningDate') as string,
        };

        try {
            if (isEditing && teacherId) {
                await updateTeacher(teacherId, data);
            } else {
                await createTeacher(data, branchId, tenantId);
            }
            router.push('/admin/teachers');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save teacher');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            required
                            defaultValue={initialData?.firstName}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Enter first name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            required
                            defaultValue={initialData?.lastName}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Enter last name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            defaultValue={initialData?.email || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="teacher@schoolama.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            defaultValue={initialData?.phone || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="+880-1XXX-XXXXXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            defaultValue={initialData?.dateOfBirth || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="gender"
                            required
                            defaultValue={initialData?.gender || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                        <textarea
                            name="address"
                            rows={3}
                            defaultValue={initialData?.address || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Enter full address"
                        />
                    </div>
                </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Employee ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="employeeId"
                            required
                            defaultValue={initialData?.employeeId}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g., TCH-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Designation <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="designation"
                            required
                            defaultValue={initialData?.designation}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g., Assistant Teacher"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                        <select
                            name="department"
                            defaultValue={initialData?.department || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Joining Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="joiningDate"
                            required
                            defaultValue={initialData?.joiningDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Qualification</label>
                        <input
                            type="text"
                            name="qualification"
                            defaultValue={initialData?.qualification || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g., B.Ed, M.Sc in Physics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                        <input
                            type="text"
                            name="specialization"
                            defaultValue={initialData?.specialization || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g., Mathematics, Physics"
                        />
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
                <Link
                    href="/admin/teachers"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Teachers
                </Link>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            {isEditing ? 'Update Teacher' : 'Add Teacher'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
