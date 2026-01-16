'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Award, AlertCircle } from 'lucide-react';

interface StudentResultViewProps {
    exams: any[];
    initialResult: any | null;
    initialExamId: string;
}

export default function StudentResultView({ exams, initialResult, initialExamId }: StudentResultViewProps) {
    const router = useRouter();
    const [selectedExamId, setSelectedExamId] = useState(initialExamId);

    const handleExamChange = (examId: string) => {
        setSelectedExamId(examId);
        router.push(`?examId=${examId}`);
    };

    return (
        <div className="space-y-6">
            {/* Exam Selector */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <FileText className="text-blue-600 w-5 h-5" />
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Exam / Term</label>
                    <select
                        value={selectedExamId}
                        onChange={(e) => handleExamChange(e.target.value)}
                        className="w-full md:w-64 p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {exams.length === 0 && <option>No exams found</option>}
                        {exams.map(e => (
                            <option key={e.id} value={e.id}>{e.name} - {new Date(e.startDate).getFullYear()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Result Card */}
            {initialResult ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{initialResult.examName} Result</h2>
                            <p className="text-slate-500">{initialResult.className}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 uppercase font-semibold">GPA</div>
                                <div className="text-xl font-bold text-blue-600">{initialResult.summary.gpa}</div>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 uppercase font-semibold">Grade</div>
                                <div className={`text-xl font-bold ${initialResult.summary.grade === 'F' ? 'text-red-600' : 'text-green-600'}`}>
                                    {initialResult.summary.grade}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4 text-center">Full Marks</th>
                                    <th className="px-6 py-4 text-center">Obtained</th>
                                    <th className="px-6 py-4 text-center">Grade</th>
                                    <th className="px-6 py-4 text-center">Point</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {initialResult.results.map((subject: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {subject.subject}
                                            <div className="text-xs text-slate-400 font-normal">{subject.code}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-500">{subject.fullMarks}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                                            {subject.marksObtained !== null ? subject.marksObtained : '-'}
                                        </td>
                                        <td className={`px-6 py-4 text-center font-bold ${subject.grade === 'F' ? 'text-red-500' : 'text-slate-700'}`}>
                                            {subject.grade}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-500">
                                            {subject.gradePoint.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                                <tr>
                                    <td className="px-6 py-4">Total</td>
                                    <td className="px-6 py-4 text-center">{initialResult.summary.totalFullMarks}</td>
                                    <td className="px-6 py-4 text-center">{initialResult.summary.totalMarks}</td>
                                    <td className="px-6 py-4"></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-medium">No Results Available</h3>
                    <p className="text-slate-500 text-sm">Select an exam to view your result card</p>
                </div>
            )}
        </div>
    );
}
