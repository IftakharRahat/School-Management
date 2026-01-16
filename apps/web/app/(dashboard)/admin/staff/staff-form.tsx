'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createStaff, updateStaff, type StaffFormData } from './actions';

interface StaffFormProps {
    branchId: string;
    tenantId: string;
    initialData?: Partial<StaffFormData & { id?: string }>;
    isEditing?: boolean;
    staffId?: string;
}

export default function StaffForm({ branchId, tenantId, initialData, isEditing = false, staffId }: StaffFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Helper to get formatted date string (YYYY-MM-DD or ISO start)
        const joiningDate = formData.get('joiningDate') as string;

        const data: StaffFormData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            password: formData.get('password') as string,

            employeeId: formData.get('employeeId') as string,
            designation: formData.get('designation') as string,
            department: formData.get('department') as string || null,
            joiningDate: joiningDate,
            salary: formData.get('salary') ? Number(formData.get('salary')) : null,
        };

        try {
            if (isEditing && staffId) {
                // Remove password if not changing
                if (!data.password) delete data.password;
                await updateStaff(staffId, data);
            } else {
                await createStaff(data, branchId, tenantId);
            }
            router.push('/admin/staff');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save staff member');
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
                            defaultValue={initialData?.email}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="staff@school.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            defaultValue={initialData?.phone || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="+880-1XXX-XXXXXX"
                        />
                    </div>

                    {!isEditing && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                required={!isEditing}
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Set initial password"
                            />
                            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Employment Details</h2>
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
                            placeholder="e.g. STF-2024-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Designation <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="designation"
                            required
                            defaultValue={initialData?.designation || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select Designation</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Librarian">Librarian</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Admin Assistant">Admin Assistant</option>
                            <option value="Clerk">Clerk</option>
                            <option value="Driver">Driver</option>
                            <option value="Security">Security</option>
                            <option value="Cleaner">Cleaner</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Department
                        </label>
                        <select
                            name="department"
                            defaultValue={initialData?.department || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">Select Department</option>
                            <option value="Administration">Administration</option>
                            <option value="Finance">Finance</option>
                            <option value="Library">Library</option>
                            <option value="Transport">Transport</option>
                            <option value="Security">Security</option>
                            <option value="Maintenance">Maintenance</option>
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
                            defaultValue={initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Salary
                        </label>
                        <input
                            type="number"
                            name="salary"
                            min="0"
                            step="0.01"
                            defaultValue={initialData?.salary || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
                <Link
                    href="/admin/staff"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Staff
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
                            {isEditing ? 'Update Staff member' : 'Add Staff Member'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
