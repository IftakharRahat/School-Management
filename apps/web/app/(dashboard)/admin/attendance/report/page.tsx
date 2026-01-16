import { redirect } from 'next/navigation';
import { FileText, Filter } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../../homework/actions';
import { getAttendanceMasterData } from '../actions';
import { getMonthlyAttendanceReport } from './actions';
import ReportFilter from './report-filter';

export default async function AttendanceReportPage({
    searchParams,
}: {
    searchParams: { classId?: string; sectionId?: string; month?: string; year?: string };
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const classes = await getAttendanceMasterData(branchId);

    // Default to current month/year
    const now = new Date();
    const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1;
    const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();

    const reportData = (searchParams.classId && searchParams.sectionId)
        ? await getMonthlyAttendanceReport(branchId, searchParams.classId, searchParams.sectionId, month, year)
        : [];

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6 flex items-center gap-2 print:hidden">
                <FileText className="text-blue-600 h-6 w-6" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance Report</h1>
                    <p className="text-slate-500">Monthly attendance summary</p>
                </div>
            </div>

            <div className="mb-6 print:hidden">
                <ReportFilter
                    classes={classes}
                    selectedClassId={searchParams.classId}
                    selectedSectionId={searchParams.sectionId}
                    selectedMonth={month}
                    selectedYear={year}
                />
            </div>

            {searchParams.sectionId && reportData.length > 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto print:border-none print:shadow-none">
                    {/* Print Header */}
                    <div className="hidden print:block mb-4 text-center">
                        <h2 className="text-xl font-bold">Monthly Attendance Report</h2>
                        <p>{new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>

                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] print:bg-white text-center">
                                <th className="px-2 py-2 border border-slate-200 sticky left-0 bg-slate-50 print:static min-w-[150px] text-left z-10">Student</th>
                                {daysArray.map(d => (
                                    <th key={d} className="w-6 border border-slate-200">{d}</th>
                                ))}
                                <th className="px-2 border border-slate-200 bg-green-50 print:bg-white text-green-700">P</th>
                                <th className="px-2 border border-slate-200 bg-red-50 print:bg-white text-red-700">A</th>
                                <th className="px-2 border border-slate-200 bg-yellow-50 print:bg-white text-yellow-700">L</th>
                                <th className="px-2 border border-slate-200 bg-slate-100 print:bg-white">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((student) => {
                                const percentage = student.stats.total > 0
                                    ? Math.round(((student.stats.present + student.stats.late) / student.stats.total) * 100)
                                    : 0;

                                return (
                                    <tr key={student.studentId} className="hover:bg-slate-50 print:hover:bg-transparent">
                                        <td className="px-2 py-1.5 font-medium border border-slate-200 sticky left-0 bg-white print:static z-10 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{student.name}</span>
                                                <span className="text-[10px] text-slate-400">Roll: {student.rollNo}</span>
                                            </div>
                                        </td>
                                        {daysArray.map(d => {
                                            const status = student.attendance[d];
                                            let symbol = '';
                                            let colorClass = '';

                                            if (status === 'PRESENT') { symbol = 'P'; colorClass = 'text-green-600 bg-green-50'; }
                                            else if (status === 'ABSENT') { symbol = 'A'; colorClass = 'text-red-600 bg-red-50 font-bold'; }
                                            else if (status === 'LATE') { symbol = 'L'; colorClass = 'text-yellow-600 bg-yellow-50'; }
                                            else if (status === 'EXCUSED') { symbol = 'E'; colorClass = 'text-blue-600 bg-blue-50'; }

                                            return (
                                                <td key={d} className={`border border-slate-200 text-center font-medium ${colorClass}`}>
                                                    {symbol}
                                                </td>
                                            );
                                        })}
                                        <td className="border border-slate-200 text-center bg-green-50 font-bold text-green-700">{student.stats.present}</td>
                                        <td className="border border-slate-200 text-center bg-red-50 font-bold text-red-700">{student.stats.absent}</td>
                                        <td className="border border-slate-200 text-center bg-yellow-50 font-bold text-yellow-700">{student.stats.late}</td>
                                        <td className="border border-slate-200 text-center bg-slate-100 font-bold">
                                            {percentage}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300 print:hidden">
                    <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-medium">Select Class to Generate Report</h3>
                    <p className="text-slate-500 text-sm">Choose Month, Class & Section above</p>
                </div>
            )}
        </div>
    );
}
