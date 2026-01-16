import { redirect } from 'next/navigation';
import { CheckCircle, Filter, Trophy, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../homework/actions';
import { getExamsForResults, getClassResultSummary } from './actions';

export default async function AdminResultsPage({
    searchParams
}: {
    searchParams: { examId?: string; sectionId?: string }
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    const exams = await getExamsForResults(branchId);

    const selectedExamId = searchParams.examId || (exams[0]?.id);
    const selectedExam = exams.find(e => e.id === selectedExamId);

    const students = selectedExamId ? await getClassResultSummary(selectedExamId, searchParams.sectionId) : [];

    // Stats
    const totalStudents = students.length;
    const passed = students.filter(s => s.grade !== 'F' && s.grade !== '-').length;
    const failed = students.filter(s => s.grade === 'F').length;
    const passRate = totalStudents > 0 ? Math.round((passed / totalStudents) * 100) : 0;

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="text-blue-600" />
                    Result Management
                </h1>
                <p className="text-slate-500">View and print student result cards</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <form className="contents">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Exam</label>
                        <div className="flex gap-2">
                            <select
                                name="examId"
                                defaultValue={selectedExamId}
                                className="w-64 p-2 border border-slate-200 rounded-lg text-sm"
                            >
                                {exams.map(e => (
                                    <option key={e.id} value={e.id}>{e.name} - {e.class.name}</option>
                                ))}
                            </select>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                Show
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {selectedExam && students.length > 0 ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold">Total Students</div>
                            <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                            <div className="text-xs text-green-700 uppercase font-bold flex items-center gap-1">
                                <Trophy size={14} /> Passed
                            </div>
                            <div className="text-2xl font-bold text-green-700">{passed}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                            <div className="text-xs text-red-700 uppercase font-bold flex items-center gap-1">
                                <AlertCircle size={14} /> Failed
                            </div>
                            <div className="text-2xl font-bold text-red-700">{failed}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                            <div className="text-xs text-blue-700 uppercase font-bold">Pass Rate</div>
                            <div className="text-2xl font-bold text-blue-700">{passRate}%</div>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Roll</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4 text-center">Total Marks</th>
                                    <th className="px-6 py-4 text-center">GPA</th>
                                    <th className="px-6 py-4 text-center">Grade</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-600">{student.rollNo}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{student.totalMarks}</td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">{student.gpa}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${student.grade === 'F' ? 'bg-red-100 text-red-700' :
                                                student.grade === '-' ? 'bg-slate-100 text-slate-500' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/results/${selectedExamId}/${student.studentId}`}
                                                className="text-blue-600 hover:underline font-medium text-xs"
                                            >
                                                View Card
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-medium">No results found</h3>
                    <p className="text-slate-500 text-sm">Create an exam and enter marks to see results here</p>
                </div>
            )}
        </div>
    );
}
