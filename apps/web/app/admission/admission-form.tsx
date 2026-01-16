'use client';

import { useState } from 'react';
import { GraduationCap, Send, Loader2, CheckCircle } from 'lucide-react';
import { submitAdmission } from './actions';

type Branch = { id: string; name: string };

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CLASS_OPTIONS = ['Play', 'Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function AdmissionForm({ branches }: { branches: Branch[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        branchId: branches[0]?.id || '',
        studentName: '',
        dateOfBirth: '',
        gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
        bloodGroup: '',
        religion: '',
        address: '',
        guardianName: '',
        guardianRelation: 'Father',
        guardianPhone: '',
        guardianEmail: '',
        guardianOccupation: '',
        previousSchool: '',
        previousClass: '',
        applyingForClass: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const result = await submitAdmission(form);

        if (result?.success) {
            setIsSuccess(true);
            setApplicationId(result.applicationId || '');
        } else {
            setError(result?.error || 'Failed to submit');
        }

        setIsSubmitting(false);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
                    <p className="text-slate-600 mb-4">
                        Your admission application has been submitted successfully. We will review it and contact you soon.
                    </p>
                    <div className="bg-slate-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-500">Application ID</p>
                        <p className="font-mono font-bold text-slate-800">{applicationId}</p>
                    </div>
                    <p className="text-sm text-slate-500">
                        Please save this ID for future reference.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
                        <GraduationCap className="text-blue-600" size={24} />
                        <span className="font-bold text-slate-800">SchooLama</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Admission Application</h1>
                    <p className="text-slate-600 mt-2">Fill out the form below to apply for admission</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Branch Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Branch *</label>
                        <select
                            value={form.branchId}
                            onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Student Information */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={form.studentName}
                                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                                    placeholder="Student's full name"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                                <input
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                                <select
                                    value={form.bloodGroup}
                                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    {BLOOD_GROUPS.map((bg) => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Religion</label>
                                <input
                                    type="text"
                                    value={form.religion}
                                    onChange={(e) => setForm({ ...form, religion: e.target.value })}
                                    placeholder="e.g., Islam, Hindu, Christian"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Full address"
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guardian Information */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Guardian Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Name *</label>
                                <input
                                    type="text"
                                    value={form.guardianName}
                                    onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                                    placeholder="Guardian's full name"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Relation *</label>
                                <select
                                    value={form.guardianRelation}
                                    onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={form.guardianPhone}
                                    onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.guardianEmail}
                                    onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                                <input
                                    type="text"
                                    value={form.guardianOccupation}
                                    onChange={(e) => setForm({ ...form, guardianOccupation: e.target.value })}
                                    placeholder="e.g., Business, Teacher, Doctor"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Previous School</label>
                                <input
                                    type="text"
                                    value={form.previousSchool}
                                    onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                                    placeholder="Name of previous school (if any)"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Previous Class</label>
                                <input
                                    type="text"
                                    value={form.previousClass}
                                    onChange={(e) => setForm({ ...form, previousClass: e.target.value })}
                                    placeholder="Last attended class"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Applying for Class *</label>
                                <select
                                    value={form.applyingForClass}
                                    onChange={(e) => setForm({ ...form, applyingForClass: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select class...</option>
                                    {CLASS_OPTIONS.map((c) => (
                                        <option key={c} value={c}>Class {c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="border-t pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    By submitting this form, you agree to our terms and conditions.
                </p>
            </div>
        </div>
    );
}
