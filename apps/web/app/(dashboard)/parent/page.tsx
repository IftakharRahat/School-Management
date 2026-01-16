import Header from '@/components/Header';
import { BookOpen, Calendar, FileText, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';

// Children data for parent view
const CHILDREN = [
    {
        id: '1',
        name: 'Rafiq Ahmed',
        class: 'Class 8A',
        roll: '15',
        attendance: '96%',
        avatar: 'https://picsum.photos/seed/child1/200',
    },
];

// Recent Results
const RECENT_RESULTS = [
    { subject: 'Mathematics', marks: '85/100', grade: 'A', date: '10/01/2024' },
    { subject: 'Physics', marks: '78/100', grade: 'A-', date: '10/01/2024' },
    { subject: 'English', marks: '82/100', grade: 'A', date: '09/01/2024' },
    { subject: 'Bengali', marks: '88/100', grade: 'A+', date: '09/01/2024' },
];

// Fee Status
const FEE_STATUS = [
    { month: 'January 2024', amount: '৳5,500', status: 'paid', dueDate: '10/01/2024' },
    { month: 'February 2024', amount: '৳5,500', status: 'due', dueDate: '10/02/2024' },
];

// Upcoming Events
const ANNOUNCEMENTS = [
    { title: 'Half Yearly Exam', date: '20/01/2024', type: 'exam' },
    { title: 'Parent-Teacher Meeting', date: '25/01/2024', type: 'meeting' },
    { title: 'Sports Day', date: '05/02/2024', type: 'event' },
];

export default function ParentDashboard() {
    const child = CHILDREN[0];

    return (
        <>
            <Header />
            <div className="p-6 space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold">Welcome, Parent!</h1>
                    <p className="text-purple-100 mt-1">Stay connected with your child&apos;s academic progress.</p>
                </div>

                {/* Child Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Your Child</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-100 shrink-0 relative">
                            <Image
                                src={child.avatar}
                                alt={child.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800">{child.name}</h3>
                            <p className="text-slate-500">{child.class} • Roll No: {child.roll}</p>
                        </div>
                        <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                            <p className="text-sm text-green-600">Attendance</p>
                            <p className="text-2xl font-bold text-green-700">{child.attendance}</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Recent Results */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Recent Results</h2>
                                <GraduationCap size={20} className="text-slate-400" />
                            </div>
                            <div className="space-y-4">
                                {RECENT_RESULTS.map((result, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <BookOpen size={18} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{result.subject}</p>
                                                <p className="text-sm text-slate-500">{result.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">{result.marks}</p>
                                            <span className={`text-sm font-medium px-2 py-0.5 rounded ${result.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {result.grade}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fee Status */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Fee Status</h2>
                                <FileText size={20} className="text-slate-400" />
                            </div>
                            <div className="space-y-4">
                                {FEE_STATUS.map((fee, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-xl ${fee.status === 'paid' ? 'bg-green-50' : 'bg-amber-50'
                                        }`}>
                                        <div>
                                            <p className="font-medium text-slate-800">{fee.month}</p>
                                            <p className="text-sm text-slate-500">Due: {fee.dueDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">{fee.amount}</p>
                                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${fee.status === 'paid' ? 'text-green-700' : 'text-amber-700'
                                                }`}>
                                                {fee.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                {fee.status === 'paid' ? 'Paid' : 'Due'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                                Pay Fees Online
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h2>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-700 font-medium hover:bg-blue-100 transition-colors">
                                    <Calendar size={18} />
                                    View Timetable
                                </a>
                                <a href="#" className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl text-purple-700 font-medium hover:bg-purple-100 transition-colors">
                                    <GraduationCap size={18} />
                                    All Results
                                </a>
                                <a href="#" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-green-700 font-medium hover:bg-green-100 transition-colors">
                                    <BookOpen size={18} />
                                    Homework
                                </a>
                                <a href="#" className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-amber-700 font-medium hover:bg-amber-100 transition-colors">
                                    <FileText size={18} />
                                    Fee History
                                </a>
                            </div>
                        </div>

                        {/* Announcements */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Upcoming</h2>
                            <div className="space-y-4">
                                {ANNOUNCEMENTS.map((item, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${item.type === 'exam' ? 'bg-red-50 border-red-100' :
                                            item.type === 'meeting' ? 'bg-blue-50 border-blue-100' :
                                                'bg-green-50 border-green-100'
                                        }`}>
                                        <p className={`text-sm font-bold ${item.type === 'exam' ? 'text-red-800' :
                                                item.type === 'meeting' ? 'text-blue-800' :
                                                    'text-green-800'
                                            }`}>{item.title}</p>
                                        <p className={`text-xs ${item.type === 'exam' ? 'text-red-600' :
                                                item.type === 'meeting' ? 'text-blue-600' :
                                                    'text-green-600'
                                            }`}>{item.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
