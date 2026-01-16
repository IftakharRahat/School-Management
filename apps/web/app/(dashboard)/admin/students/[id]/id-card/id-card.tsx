'use client';

import { useRef } from 'react';
import { Printer, Download } from 'lucide-react';

interface Student {
    id: string;
    admissionNo: string;
    dateOfBirth?: Date | null;
    bloodGroup?: string | null;
    user: {
        name: string;
        email: string;
        phone?: string | null;
        avatar?: string | null;
    };
    enrollments?: {
        section: {
            name: string;
            class: {
                name: string;
            };
        };
    }[];
}

interface IDCardProps {
    student: Student;
    schoolName?: string;
    schoolAddress?: string;
    schoolLogo?: string;
}

export default function StudentIDCard({
    student,
    schoolName = 'SchooLama School',
    schoolAddress = '123 Education Street, City',
    schoolLogo,
}: IDCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const currentEnrollment = student.enrollments?.[0];
    const className = currentEnrollment?.section?.class?.name || 'N/A';
    const sectionName = currentEnrollment?.section?.name || 'N/A';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-4">
            {/* Print/Download Buttons */}
            <div className="flex gap-3 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Printer className="w-4 h-4" />
                    Print ID Card
                </button>
            </div>

            {/* ID Card */}
            <div
                ref={cardRef}
                className="w-[340px] mx-auto print:mx-0"
                style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
            >
                {/* Front of Card */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="bg-white/10 px-4 py-3 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            {schoolLogo ? (
                                <img src={schoolLogo} alt="School Logo" className="w-10 h-10 rounded-full bg-white p-1" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg">
                                    S
                                </div>
                            )}
                            <div>
                                <h2 className="text-white font-bold text-sm">{schoolName}</h2>
                                <p className="text-white/70 text-xs">{schoolAddress}</p>
                            </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="p-4">
                        <div className="flex gap-4">
                            {/* Photo */}
                            <div className="w-24 h-28 bg-white rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/30">
                                {student.user.avatar ? (
                                    <img
                                        src={student.user.avatar}
                                        alt={student.user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold">
                                        {student.user.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="text-white/60 text-xs uppercase">Student Name</p>
                                    <p className="text-white font-semibold">{student.user.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-white/60 text-xs uppercase">Class</p>
                                        <p className="text-white font-medium text-sm">{className}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-xs uppercase">Section</p>
                                        <p className="text-white font-medium text-sm">{sectionName}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white/60 text-xs uppercase">Admission No</p>
                                    <p className="text-white font-mono font-semibold">{student.admissionNo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-white/60 text-xs uppercase">Blood Group</p>
                                <p className="text-white font-medium">{student.bloodGroup || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs uppercase">Contact</p>
                                <p className="text-white font-medium text-sm">{student.user.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white/10 px-4 py-2 text-center border-t border-white/20">
                        <p className="text-white/80 text-xs">
                            Valid for Academic Year {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    #id-card-printable, #id-card-printable * {
                        visibility: visible;
                    }
                    #id-card-printable {
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                }
            `}</style>
        </div>
    );
}
