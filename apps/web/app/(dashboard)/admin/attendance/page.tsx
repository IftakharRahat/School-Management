import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Calendar as CalendarIcon, Filter, FileText } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../homework/actions';
import { getAttendanceMasterData } from './actions';
import ClientFilter from './client-filter'; // We'll create this to reuse the selector pattern
import AttendanceSheet from './attendance-sheet';

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ classId?: string; sectionId?: string; date?: string }>;
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const params = await searchParams;
    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const classes = await getAttendanceMasterData(branchId);

    // Default to today if date not provided
    const dateStr = params.date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(dateStr);

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Daily Attendance
                    </h1>
                    <p className="text-slate-500">Mark student attendance for {dateObj.toDateString()}</p>
                </div>
                <Link
                    href="/admin/attendance/report"
                    className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                >
                    <FileText size={18} />
                    View Monthly Report
                </Link>
            </div>

            {/* Filter */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <ClientFilter
                    classes={classes}
                    selectedClassId={params.classId}
                    selectedSectionId={params.sectionId}
                    selectedDate={dateStr}
                />
            </div>

            {/* Main Content */}
            {params.sectionId ? (
                <AttendanceSheet
                    classId={params.classId!}
                    sectionId={params.sectionId}
                    date={dateObj}
                />
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-medium">No Section Selected</h3>
                    <p className="text-slate-500 text-sm">Please select a class and section to view student list</p>
                </div>
            )}
        </div>
    );
}
