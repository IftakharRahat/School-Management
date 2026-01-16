'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createStudent, updateStudent, type StudentFormData } from '../actions';

interface ClassWithSections {
    id: string;
    name: string;
    grade: number;
    sections: { id: string; name: string }[];
}

interface Guardian {
    id: string;
    user: { name: string; phone: string | null };
}

interface StudentFormProps {
    classes: ClassWithSections[];
    guardians: Guardian[];
    branchId: string;
    tenantId: string;
    initialData?: Partial<StudentFormData>;
    isEditing?: boolean;
    studentId?: string;
}

export default function StudentForm({ classes, guardians, branchId, tenantId, initialData, isEditing = false, studentId }: StudentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedClassId, setSelectedClassId] = useState(initialData?.classId || '');

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const sections = selectedClass?.sections || [];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const data: StudentFormData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string || null,
            phone: formData.get('phone') as string || null,
            dateOfBirth: formData.get('dateOfBirth') as string || null,
            gender: formData.get('gender') as 'MALE' | 'FEMALE' | 'OTHER',
            bloodGroup: formData.get('bloodGroup') as string || null,
            address: formData.get('address') as string || null,
            admissionNo: formData.get('admissionNo') as string,
            admissionDate: formData.get('admissionDate') as string,
            classId: formData.get('classId') as string,
            sectionId: formData.get('sectionId') as string,
            guardianId: formData.get('guardianId') as string || null,
        };

        try {
            if (isEditing && studentId) {
                await updateStudent(studentId, data);
            } else {
                await createStudent(data, branchId, tenantId);
            }
            router.push('/admin/students');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save student');
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={initialData?.email || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="student@email.com"
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
                        <select
                            name="bloodGroup"
                            defaultValue={initialData?.bloodGroup || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
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

            {/* Admission Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Admission Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Admission Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="admissionNo"
                            required
                            defaultValue={initialData?.admissionNo}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g., STU-2024-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Admission Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="admissionDate"
                            required
                            defaultValue={initialData?.admissionDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="classId"
                            required
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Section <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="sectionId"
                            required
                            defaultValue={initialData?.sectionId}
                            disabled={!selectedClassId}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select section</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Guardian Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Guardian Information</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Guardian</label>
                    <select
                        name="guardianId"
                        defaultValue={initialData?.guardianId || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="">Select guardian (optional)</option>
                        {guardians.map((guardian) => (
                            <option key={guardian.id} value={guardian.id}>
                                {guardian.user.name} - {guardian.user.phone}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-slate-500 mt-2">
                        Don&apos;t see the guardian? <Link href="/admin/guardians/new?returnTo=/admin/students/new" className="text-blue-600 hover:underline">Add new guardian</Link>
                    </p>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Relationship</label>
                    <select
                        name="relation"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="FATHER">Father</option>
                        <option value="MOTHER">Mother</option>
                        <option value="BROTHER">Brother</option>
                        <option value="SISTER">Sister</option>
                        <option value="UNCLE">Uncle</option>
                        <option value="AUNT">Aunt</option>
                        <option value="GRANDFATHER">Grandfather</option>
                        <option value="GRANDMOTHER">Grandmother</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
                <Link
                    href="/admin/students"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Students
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
                            {isEditing ? 'Update Student' : 'Add Student'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
