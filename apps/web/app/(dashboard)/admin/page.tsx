import Header from '@/components/Header';
import {
    Users, GraduationCap, UserCheck, Building2,
    DollarSign, TrendingUp, Calendar, Bell
} from 'lucide-react';
import Link from 'next/link';

// Admin KPI Stats
const ADMIN_STATS = [
    { icon: Users, label: 'Total Students', value: '1,245', change: '+12%', color: 'bg-blue-500' },
    { icon: GraduationCap, label: 'Total Teachers', value: '48', change: '+3%', color: 'bg-purple-500' },
    { icon: UserCheck, label: 'Attendance Rate', value: '94.2%', change: '+2.1%', color: 'bg-green-500' },
    { icon: DollarSign, label: 'Fee Collection', value: '৳12.4M', change: '+8%', color: 'bg-amber-500' },
];

// Quick Actions for Admin
const QUICK_ACTIONS = [
    { label: 'Add Student', href: '/admin/students/new', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Add Teacher', href: '/admin/teachers/new', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Create Class', href: '/admin/classes/new', color: 'bg-green-50 text-green-600 border-green-100' },
    { label: 'Fee Setup', href: '/admin/fees', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Announcements', href: '/admin/announcements', color: 'bg-pink-50 text-pink-600 border-pink-100' },
    { label: 'Reports', href: '/admin/reports', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
];

// Branch Performance Data
const BRANCHES = [
    { name: 'Main Campus', students: 856, teachers: 32, attendance: '95.2%', fees: '92%' },
    { name: 'North Branch', students: 389, teachers: 16, attendance: '93.1%', fees: '88%' },
];

// Recent Activities
const RECENT_ACTIVITIES = [
    { action: 'New student enrolled', details: 'Rafiq Ahmed - Class 8A', time: '2 hours ago', type: 'student' },
    { action: 'Fee payment received', details: '৳15,000 from Karim Hossain', time: '3 hours ago', type: 'payment' },
    { action: 'Exam schedule published', details: 'Half Yearly Exam 2024', time: '5 hours ago', type: 'exam' },
    { action: 'Teacher leave approved', details: 'Fatima Begum - 3 days', time: '1 day ago', type: 'leave' },
];

export default function AdminDashboard() {
    return (
        <>
            <Header />
            <div className="p-6 space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold">Welcome back, Adam!</h1>
                    <p className="text-blue-100 mt-1">Here&apos;s what&apos;s happening at your school today.</p>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ADMIN_STATS.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                    <div className="text-sm text-slate-500">{stat.label}</div>
                                </div>
                                <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Branch Performance */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Branch Performance</h2>
                                <Building2 size={20} className="text-slate-400" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm font-medium text-slate-500 border-b border-slate-100">
                                            <th className="pb-3">Branch</th>
                                            <th className="pb-3">Students</th>
                                            <th className="pb-3">Teachers</th>
                                            <th className="pb-3">Attendance</th>
                                            <th className="pb-3">Fee Collection</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {BRANCHES.map((branch, idx) => (
                                            <tr key={idx} className="border-b border-slate-50 last:border-0">
                                                <td className="py-4 font-medium text-slate-800">{branch.name}</td>
                                                <td className="py-4 text-slate-600">{branch.students}</td>
                                                <td className="py-4 text-slate-600">{branch.teachers}</td>
                                                <td className="py-4">
                                                    <span className="text-green-600 font-medium">{branch.attendance}</span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px]">
                                                            <div
                                                                className="h-2 bg-blue-500 rounded-full"
                                                                style={{ width: branch.fees }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-slate-600">{branch.fees}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                                <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {RECENT_ACTIVITIES.map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'student' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                                                    activity.type === 'exam' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-amber-100 text-amber-600'
                                            }`}>
                                            {activity.type === 'student' ? <Users size={18} /> :
                                                activity.type === 'payment' ? <DollarSign size={18} /> :
                                                    activity.type === 'exam' ? <Calendar size={18} /> :
                                                        <Bell size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                                            <p className="text-sm text-slate-500 truncate">{activity.details}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {QUICK_ACTIONS.map((action, idx) => (
                                    <Link
                                        key={idx}
                                        href={action.href}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium border text-center hover:opacity-80 transition-opacity ${action.color}`}
                                    >
                                        {action.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Upcoming Events</h2>
                                <Calendar size={20} className="text-slate-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-blue-800">Half Yearly Exam</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">In 5 days</span>
                                    </div>
                                    <p className="text-xs text-blue-600">All classes - Main Campus</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-purple-800">Parent-Teacher Meeting</span>
                                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">In 12 days</span>
                                    </div>
                                    <p className="text-xs text-purple-600">Class 1-6 - Both Campuses</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-amber-800">Annual Sports Day</span>
                                        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">In 20 days</span>
                                    </div>
                                    <p className="text-xs text-amber-600">All students - Main Campus</p>
                                </div>
                            </div>
                        </div>

                        {/* Fee Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Fee Summary</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Collected</span>
                                    <span className="text-sm font-bold text-green-600">৳12,400,000</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Pending</span>
                                    <span className="text-sm font-bold text-amber-600">৳1,850,000</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Overdue</span>
                                    <span className="text-sm font-bold text-red-600">৳320,000</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full flex">
                                        <div className="bg-green-500 h-full" style={{ width: '85%' }} />
                                        <div className="bg-amber-500 h-full" style={{ width: '12%' }} />
                                        <div className="bg-red-500 h-full" style={{ width: '3%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
