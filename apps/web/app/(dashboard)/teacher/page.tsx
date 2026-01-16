import Header from '@/components/Header';
import Schedule from '@/components/Schedule';
import PerformanceChart from '@/components/PerformanceChart';
import { Mail, Phone, Calendar, Edit2 } from 'lucide-react';
import Image from 'next/image';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    bgColor: string;
}

const STATS: StatCardProps[] = [
    { icon: '📅', label: 'Attendance', value: '98%', bgColor: 'bg-blue-50' },
    { icon: '🏫', label: 'Branches', value: 2, bgColor: 'bg-purple-50' },
    { icon: '🍰', label: 'Lessons', value: 8, bgColor: 'bg-pink-50' },
    { icon: '📚', label: 'Classes', value: 4, bgColor: 'bg-indigo-50' },
];

interface Announcement {
    id: string;
    title: string;
    date: string;
    description: string;
    color: string;
}

const ANNOUNCEMENTS: Announcement[] = [
    {
        id: '1',
        title: 'Picture Day Reminder',
        date: '16/09/2024',
        description: "School Picture Day is tomorrow! Don't forget to wear your full uniform and bring your best smile.",
        color: 'bg-blue-50'
    },
    {
        id: '2',
        title: 'Book Fair Opening',
        date: '16/09/2024',
        description: 'The annual Book Fair will open this Thursday. Stop by the library to browse the newest books.',
        color: 'bg-purple-50'
    },
    {
        id: '3',
        title: 'Sports Day Postponed',
        date: '16/09/2024',
        description: 'Due to weather, Sports Day has been postponed. A new date will be announced soon.',
        color: 'bg-yellow-50'
    }
];

export default function TeacherDashboard() {
    return (
        <>
            <Header />
            <div className="p-6 space-y-8">
                {/* Top Section: Teacher Profile and Quick Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Teacher Card */}
                    <div className="xl:col-span-8 bg-blue-100/50 rounded-2xl p-6 border border-blue-200/50 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-white/60 p-1.5 rounded-md cursor-pointer hover:bg-white transition-colors">
                            <Edit2 size={16} className="text-slate-700" />
                        </div>

                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0 relative">
                            <Image
                                src="https://picsum.photos/seed/teacher/200"
                                alt="Daniel Adams"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Daniel Adams</h1>
                                <p className="text-slate-500 text-sm mt-1 max-w-md">
                                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto, eveniet ducimus.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                    <span className="text-slate-400 font-bold">A+</span>
                                    <span>Blood Group</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="font-medium">14/09/1994</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700 overflow-hidden">
                                    <Mail size={14} className="text-slate-400 shrink-0" />
                                    <span className="font-medium truncate">daniel@example.com</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Phone size={14} className="text-slate-400 shrink-0" />
                                    <span className="font-medium">136-367-467</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="xl:col-span-4 grid grid-cols-2 gap-4">
                        {STATS.map((stat, idx) => (
                            <div key={idx} className={`${stat.bgColor} rounded-2xl p-4 border border-white flex gap-4 items-center`}>
                                <div className="text-2xl">{stat.icon}</div>
                                <div>
                                    <div className="text-xl font-bold text-slate-800 leading-none">{stat.value}</div>
                                    <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-tight">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content: Schedule and Right Panel */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Middle Section: Schedule */}
                    <div className="xl:col-span-8">
                        <Schedule />
                    </div>

                    {/* Right Side Panel */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Shortcuts */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Shortcuts</h2>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 cursor-pointer hover:bg-blue-100">Teacher&apos;s Classes</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100 cursor-pointer hover:bg-purple-100">Teacher&apos;s Students</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-100 cursor-pointer hover:bg-yellow-100">Teacher&apos;s Lessons</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-50 text-pink-600 border border-pink-100 cursor-pointer hover:bg-pink-100">Teacher&apos;s Exams</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-50 text-cyan-600 border border-cyan-100 cursor-pointer hover:bg-cyan-100">Teacher&apos;s Assignments</span>
                            </div>
                        </div>

                        {/* Performance */}
                        <PerformanceChart />

                        {/* Announcements */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Announcements</h2>
                                <a href="#" className="text-xs font-semibold text-slate-400 hover:text-blue-500 transition-colors">View All</a>
                            </div>
                            <div className="space-y-4">
                                {ANNOUNCEMENTS.map((announcement) => (
                                    <div key={announcement.id} className={`${announcement.color} rounded-xl p-4 border border-white/50 relative`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-bold text-slate-800">{announcement.title}</h3>
                                            <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded uppercase">{announcement.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                            {announcement.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 group">
                <button className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                </button>
                <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                        Ask AI Assistant
                    </div>
                </div>
            </div>
        </>
    );
}
