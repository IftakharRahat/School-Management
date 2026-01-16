import { redirect } from 'next/navigation';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getStudentAttendance } from './actions';
import { format } from 'date-fns';

export default async function StudentAttendancePage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const { records, stats } = await getStudentAttendance();

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600 h-8 w-8" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
                    <p className="text-slate-500">Track your daily attendance record</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Attendance Rate</p>
                        <p className="text-xl font-bold text-slate-900">{stats.percentage}%</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Days Present</p>
                        <p className="text-xl font-bold text-green-700">{stats.present}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Late Arrivals</p>
                        <p className="text-xl font-bold text-yellow-700">{stats.late}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Days Absent</p>
                        <p className="text-xl font-bold text-red-700">{stats.absent}</p>
                    </div>
                </div>
            </div>

            {/* Recent History Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">Attendance History</h3>
                    <span className="text-xs text-slate-400">Total {stats.total} days recorded</span>
                </div>

                {records.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-900">
                                            {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    record.status === 'ABSENT' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        record.status === 'LATE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {record.remarks || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p>No attendance records found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
