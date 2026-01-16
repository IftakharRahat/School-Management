'use client';

import { useState } from 'react';
import { Eye, Check, X, Clock, User, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { updateApplicationStatus } from '@/app/admission/actions';

type Application = {
    id: string;
    studentName: string;
    dateOfBirth: Date;
    gender: string;
    bloodGroup: string | null;
    address: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    guardianEmail: string | null;
    previousSchool: string | null;
    applyingForClass: string;
    status: string;
    createdAt: Date;
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    UNDER_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-700' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
    ENROLLED: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

export default function ApplicationList({ applications }: { applications: Application[] }) {
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (id: string, status: string) => {
        setIsUpdating(true);
        await updateApplicationStatus(id, status);
        setIsUpdating(false);
        setSelectedApp(null);
    };

    if (applications.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No admission applications yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Applicant</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Guardian</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Class</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Status</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Applied</th>
                            <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications.map((app) => {
                            const style = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING;
                            return (
                                <tr key={app.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">{app.studentName}</div>
                                        <div className="text-xs text-slate-400">
                                            {app.gender} • {new Date(app.dateOfBirth).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700">{app.guardianName}</div>
                                        <div className="text-xs text-slate-400">{app.guardianPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-medium text-slate-800">Class {app.applyingForClass}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-800">Application Details</h2>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Student Info */}
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-3">Student Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="text-slate-400" size={16} />
                                        <span>{selectedApp.studentName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-slate-400" size={16} />
                                        <span>{new Date(selectedApp.dateOfBirth).toLocaleDateString()}</span>
                                    </div>
                                    <div>Gender: <span className="font-medium">{selectedApp.gender}</span></div>
                                    <div>Blood Group: <span className="font-medium">{selectedApp.bloodGroup || 'N/A'}</span></div>
                                    <div className="col-span-2 flex items-start gap-2">
                                        <MapPin className="text-slate-400 mt-0.5" size={16} />
                                        <span>{selectedApp.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Guardian Info */}
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-3">Guardian Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="text-slate-400" size={16} />
                                        <span>{selectedApp.guardianName} ({selectedApp.guardianRelation})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-slate-400" size={16} />
                                        <span>{selectedApp.guardianPhone}</span>
                                    </div>
                                    {selectedApp.guardianEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="text-slate-400" size={16} />
                                            <span>{selectedApp.guardianEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-3">Academic Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Applying For: <span className="font-medium">Class {selectedApp.applyingForClass}</span></div>
                                    <div>Previous School: <span className="font-medium">{selectedApp.previousSchool || 'N/A'}</span></div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t pt-6 flex gap-3">
                                {selectedApp.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(selectedApp.id, 'UNDER_REVIEW')}
                                            disabled={isUpdating}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <Clock size={18} />
                                            Mark Under Review
                                        </button>
                                    </>
                                )}
                                {(selectedApp.status === 'PENDING' || selectedApp.status === 'UNDER_REVIEW') && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(selectedApp.id, 'APPROVED')}
                                            disabled={isUpdating}
                                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(selectedApp.id, 'REJECTED')}
                                            disabled={isUpdating}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </>
                                )}
                                {selectedApp.status === 'APPROVED' && (
                                    <button
                                        onClick={() => handleStatusChange(selectedApp.id, 'ENROLLED')}
                                        disabled={isUpdating}
                                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        <Check size={18} />
                                        Mark as Enrolled
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
