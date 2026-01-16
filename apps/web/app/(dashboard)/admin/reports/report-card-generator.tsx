'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Search, FileText, Loader2, X } from 'lucide-react';
import { getClasses, getExams, getStudentResults } from './actions';

export default function ReportCardGenerator() {
    const [classes, setClasses] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [loading, setLoading] = useState(false);

    const [viewReport, setViewReport] = useState<any | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Report_Card_${viewReport?.student.name || 'Student'}`,
    });

    useEffect(() => {
        getClasses().then(setClasses);
    }, []);

    useEffect(() => {
        if (selectedClass) {
            getExams(selectedClass).then(setExams);
            setSelectedExam('');
            setResults([]);
        }
    }, [selectedClass]);

    const handleSearch = async () => {
        if (!selectedExam) return;
        setLoading(true);
        const data = await getStudentResults(selectedExam);
        setResults(data);
        setLoading(false);
    };

    // Calculate Grade Point (Simple 5.0 scale for example)
    const getGPA = (marks: number, total: number) => {
        const percentage = (marks / total) * 100;
        if (percentage >= 80) return 5.0;
        if (percentage >= 70) return 4.0;
        if (percentage >= 60) return 3.5;
        if (percentage >= 50) return 3.0;
        if (percentage >= 40) return 2.0;
        if (percentage >= 33) return 1.0;
        return 0.0;
    };

    const getLetterGrade = (gpa: number) => {
        if (gpa === 5.0) return 'A+';
        if (gpa >= 4.0) return 'A';
        if (gpa >= 3.5) return 'A-';
        if (gpa >= 3.0) return 'B';
        if (gpa >= 2.0) return 'C';
        if (gpa >= 1.0) return 'D';
        return 'F';
    };

    return (
        <div className="bg-white rounded-xl border p-6 min-h-[400px]">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <FileText className="text-blue-600" size={20} />
                Student Report Cards
            </h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Exam</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={selectedExam}
                        onChange={e => setSelectedExam(e.target.value)}
                        disabled={!selectedClass}
                    >
                        <option value="">Select Exam</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleSearch}
                        disabled={!selectedExam || loading}
                        className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        Find Results
                    </button>
                </div>
            </div>

            {/* Results List */}
            {results.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Roll No</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Subjects</th>
                                <th className="px-4 py-3 font-medium text-right">Total</th>
                                <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {results.map((item, idx) => {
                                const totalMarks = item.results.reduce((sum: number, r: any) => sum + r.marks, 0);
                                return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{item.student.rollNo || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{item.student.name}</div>
                                            <div className="text-xs text-slate-500">{item.student.admissionNo}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{item.results.length} Subjects</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-700">{totalMarks}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setViewReport(item)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100"
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                    Select a class and exam to view results
                </div>
            )}

            {/* Printable Report Card Modal */}
            {viewReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-lg">Report Card Preview</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                    <Printer size={16} /> Print
                                </button>
                                <button onClick={() => setViewReport(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Printable Content */}
                        <div className="p-8 bg-white" ref={printRef}>
                            <div className="text-center mb-8 border-b pb-6">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">School Management System</h1>
                                <p className="text-slate-500">Excellence in Education</p>
                                <div className="mt-4 inline-block px-4 py-1 bg-slate-100 rounded-full text-sm font-semibold uppercase tracking-wider">
                                    Progress Report
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                                <div>
                                    <p className="text-slate-500 mb-1">Student Name</p>
                                    <p className="font-bold text-lg">{viewReport.student.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 mb-1">Admission No</p>
                                    <p className="font-bold">{viewReport.student.admissionNo}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 mb-1">Class & Section</p>
                                    <p className="font-semibold">{viewReport.student.class?.name} - {viewReport.student.section?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 mb-1">Roll Number</p>
                                    <p className="font-semibold">#{viewReport.student.rollNo}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-bold text-slate-800 mb-3 border-l-4 border-blue-500 pl-3">Academic Performance</h4>
                                <table className="w-full text-sm border-collapse border border-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="border border-slate-200 px-4 py-2 text-left">Subject</th>
                                            <th className="border border-slate-200 px-4 py-2 text-center">Marks Obtained</th>
                                            <th className="border border-slate-200 px-4 py-2 text-center">Total Marks</th>
                                            <th className="border border-slate-200 px-4 py-2 text-center">Grade</th>
                                            <th className="border border-slate-200 px-4 py-2 text-center">GPA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewReport.results.map((r: any, i: number) => {
                                            const gpa = getGPA(r.marks, r.total);
                                            return (
                                                <tr key={i}>
                                                    <td className="border border-slate-200 px-4 py-2 font-medium">{r.subject}</td>
                                                    <td className="border border-slate-200 px-4 py-2 text-center">{r.marks}</td>
                                                    <td className="border border-slate-200 px-4 py-2 text-center">{r.total}</td>
                                                    <td className="border border-slate-200 px-4 py-2 text-center font-bold text-blue-600">{r.grade || getLetterGrade(gpa)}</td>
                                                    <td className="border border-slate-200 px-4 py-2 text-center">{gpa.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-slate-50 font-bold">
                                            <td className="border border-slate-200 px-4 py-2 text-right">Grand Total</td>
                                            <td className="border border-slate-200 px-4 py-2 text-center">
                                                {viewReport.results.reduce((sum: number, r: any) => sum + r.marks, 0)}
                                            </td>
                                            <td className="border border-slate-200 px-4 py-2 text-center">
                                                {viewReport.results.reduce((sum: number, r: any) => sum + r.total, 0)}
                                            </td>
                                            <td colSpan={2} className="border border-slate-200 px-4 py-2 text-center text-slate-800">
                                                GPA: {(viewReport.results.reduce((sum: number, r: any) => sum + getGPA(r.marks, r.total), 0) / viewReport.results.length || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mt-20">
                                <div className="border-t border-slate-400 pt-2 text-center text-sm font-medium text-slate-600">
                                    Class Teacher's Signature
                                </div>
                                <div className="border-t border-slate-400 pt-2 text-center text-sm font-medium text-slate-600">
                                    Principal's Signature
                                </div>
                            </div>

                            <div className="mt-8 text-center text-xs text-slate-400">
                                Generated on {new Date().toLocaleDateString()} • System Generated Report
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
