import { redirect } from 'next/navigation';
import { ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getStudentResultCard } from '../../actions';
import PrintButton from './print-button';

export default async function AdminResultCardPage({ params }: { params: Promise<{ examId: string; studentId: string }> }) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const { examId, studentId } = await params;
    const result = await getStudentResultCard(examId, studentId);

    if (!result) return <div>Result not found</div>;

    return (
        <div className="p-6 max-w-[1000px] mx-auto print:p-0 font-sans">
            {/* Nav (Hidden in print) */}
            <div className="mb-6 flex justify-between items-center print:hidden">
                <Link href={`/admin/results?examId=${examId}`} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={16} />
                    Back to Results
                </Link>
                <div className="flex gap-2">
                    <PrintButton />
                </div>
            </div>

            {/* Report Card */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:absolute print:top-0 print:left-0 print:w-full print:m-0 print:z-50">

                {/* School Header (Placeholder) */}
                <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">SchooLama High School</h1>
                    <p className="text-slate-500 text-sm mt-1">123 Education Street, Dhaka, Bangladesh</p>
                    <div className="inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-bold mt-4 uppercase tracking-wider">
                        Report Card
                    </div>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Student Name</span>
                        <span className="font-bold text-slate-900">{result.studentName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Exam Name</span>
                        <span className="font-bold text-slate-900">{result.examName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Class & Section</span>
                        <span className="font-bold text-slate-900">{result.className} - {result.sectionName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Roll Number</span>
                        <span className="font-bold text-slate-900">{result.rollNo}</span>
                    </div>
                </div>

                {/* Marks Table */}
                <table className="w-full text-sm mb-8 border border-slate-200">
                    <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 border border-slate-200 text-left">Subject</th>
                            <th className="px-4 py-3 border border-slate-200 text-center">Full Marks</th>
                            <th className="px-4 py-3 border border-slate-200 text-center">Pass Marks</th>
                            <th className="px-4 py-3 border border-slate-200 text-center">Obtained</th>
                            <th className="px-4 py-3 border border-slate-200 text-center">Grade</th>
                            <th className="px-4 py-3 border border-slate-200 text-center">GPA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {result.results.map((subject, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 border border-slate-200 font-medium">
                                    {subject.subject}
                                    <div className="text-[10px] text-slate-400">{subject.code}</div>
                                </td>
                                <td className="px-4 py-2 border border-slate-200 text-center text-slate-500">{subject.fullMarks}</td>
                                <td className="px-4 py-2 border border-slate-200 text-center text-slate-500">{subject.passMarks}</td>
                                <td className="px-4 py-2 border border-slate-200 text-center font-bold">
                                    {subject.marksObtained ?? '-'}
                                </td>
                                <td className={`px-4 py-2 border border-slate-200 text-center font-bold ${subject.grade === 'F' ? 'text-red-600' : ''}`}>
                                    {subject.grade}
                                </td>
                                <td className="px-4 py-2 border border-slate-200 text-center text-slate-500">
                                    {subject.gradePoint.toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary Section */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Total Marks</span>
                            <span className="font-bold">{result.summary.totalMarks} / {result.summary.totalFullMarks}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">GPA</span>
                            <span className="font-bold text-blue-600 text-lg">{result.summary.gpa}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-sm font-bold uppercase">Final Grade</span>
                            <span className={`font-bold text-xl ${result.summary.grade === 'F' ? 'text-red-600' : 'text-green-600'}`}>
                                {result.summary.grade}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-8 mt-20 pt-8">
                    <div className="text-center border-t border-slate-300 pt-2">
                        <p className="text-sm text-slate-500">Class Teacher</p>
                    </div>
                    <div className="text-center border-t border-slate-300 pt-2">
                        <p className="text-sm text-slate-500">Guardian</p>
                    </div>
                    <div className="text-center border-t border-slate-300 pt-2">
                        <p className="text-sm text-slate-500">Head Teacher</p>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8 print:hidden">
                <p className="text-slate-400 text-sm">
                    Use Ctrl+P / Cmd+P to print specific result
                </p>
            </div>
        </div>
    );
}
