import Header from '@/components/Header';
import Schedule from '@/components/Schedule';
import { BookOpen, FileText, Calendar, CheckCircle, Clock, Award } from 'lucide-react';
import Image from 'next/image';

// Student Profile
const STUDENT = {
    name: 'Rafiq Ahmed',
    class: 'Class 8A',
    roll: '15',
    attendance: '96%',
    avatar: 'https://picsum.photos/seed/student1/200',
};

// Today's Classes
const TODAYS_CLASSES = [
    { time: '8:00 AM', subject: 'Mathematics', teacher: 'Mr. Rahman', room: '101', status: 'done' },
    { time: '9:00 AM', subject: 'Physics', teacher: 'Mr. Adams', room: '102', status: 'done' },
    { time: '10:00 AM', subject: 'English', teacher: 'Mrs. Khan', room: '103', status: 'current' },
    { time: '11:00 AM', subject: 'Chemistry', teacher: 'Ms. Fatima', room: '104', status: 'upcoming' },
    { time: '12:00 PM', subject: 'Bengali', teacher: 'Mr. Hasan', room: '105', status: 'upcoming' },
];

// Homework
const HOMEWORK = [
    { subject: 'Mathematics', title: 'Chapter 5 Exercises', due: 'Tomorrow', status: 'pending' },
    { subject: 'Physics', title: 'Lab Report - Electricity', due: 'In 3 days', status: 'pending' },
    { subject: 'English', title: 'Essay Writing', due: 'Submitted', status: 'done' },
];

// Upcoming Exams
const EXAMS = [
    { subject: 'All Subjects', name: 'Half Yearly Exam', date: '20-25 Jan 2024' },
];

export default function StudentDashboard() {
    return (
        <>
            <Header />
            <div className="p-6 space-y-8">
                {/* Student Profile Card */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shrink-0 relative">
                        <Image
                            src={STUDENT.avatar}
                            alt={STUDENT.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{STUDENT.name}</h1>
                        <p className="text-cyan-100">{STUDENT.class} • Roll No: {STUDENT.roll}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                        <p className="text-sm text-cyan-100">Attendance</p>
                        <p className="text-2xl font-bold">{STUDENT.attendance}</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BookOpen size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">8</p>
                            <p className="text-sm text-slate-500">Subjects</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <FileText size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">3</p>
                            <p className="text-sm text-slate-500">Pending HW</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Calendar size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">5</p>
                            <p className="text-sm text-slate-500">Days to Exam</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Award size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">A+</p>
                            <p className="text-sm text-slate-500">Last Grade</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Today's Classes */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Today&apos;s Classes</h2>
                            <div className="space-y-3">
                                {TODAYS_CLASSES.map((cls, idx) => (
                                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl ${cls.status === 'done' ? 'bg-slate-50' :
                                            cls.status === 'current' ? 'bg-blue-50 border-2 border-blue-200' :
                                                'bg-white border border-slate-100'
                                        }`}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cls.status === 'done' ? 'bg-green-100' :
                                                cls.status === 'current' ? 'bg-blue-200' :
                                                    'bg-slate-100'
                                            }`}>
                                            {cls.status === 'done' ? <CheckCircle size={20} className="text-green-600" /> :
                                                cls.status === 'current' ? <Clock size={20} className="text-blue-600" /> :
                                                    <Clock size={20} className="text-slate-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${cls.status === 'done' ? 'text-slate-400' : 'text-slate-800'}`}>
                                                {cls.subject}
                                            </p>
                                            <p className="text-sm text-slate-500">{cls.teacher} • Room {cls.room}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-medium ${cls.status === 'done' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {cls.time}
                                            </p>
                                            {cls.status === 'current' && (
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Now</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Schedule */}
                        <Schedule />
                    </div>

                    {/* Right Column */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Homework */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Homework</h2>
                            <div className="space-y-4">
                                {HOMEWORK.map((hw, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl ${hw.status === 'done' ? 'bg-green-50' : 'bg-amber-50'
                                        }`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-slate-800">{hw.subject}</p>
                                                <p className="text-sm text-slate-600">{hw.title}</p>
                                            </div>
                                            {hw.status === 'done' ?
                                                <CheckCircle size={18} className="text-green-600" /> :
                                                <Clock size={18} className="text-amber-600" />
                                            }
                                        </div>
                                        <p className={`text-xs mt-2 font-medium ${hw.status === 'done' ? 'text-green-600' : 'text-amber-600'
                                            }`}>{hw.due}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Exam */}
                        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white">
                            <h2 className="text-lg font-bold mb-4">Upcoming Exam</h2>
                            {EXAMS.map((exam, idx) => (
                                <div key={idx}>
                                    <p className="text-xl font-bold">{exam.name}</p>
                                    <p className="text-red-100">{exam.subject}</p>
                                    <div className="mt-4 bg-white/20 rounded-xl p-3">
                                        <p className="text-sm text-red-100">Date</p>
                                        <p className="font-bold">{exam.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <a href="#" className="p-3 bg-blue-50 rounded-xl text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                                    Results
                                </a>
                                <a href="#" className="p-3 bg-purple-50 rounded-xl text-center text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
                                    Library
                                </a>
                                <a href="#" className="p-3 bg-green-50 rounded-xl text-center text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                                    Notices
                                </a>
                                <a href="#" className="p-3 bg-amber-50 rounded-xl text-center text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                                    Transport
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
