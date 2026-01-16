import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { signOut } from 'next-auth/react';
import {
    Home, GraduationCap, Calendar, FileText,
    Clock, Bell, Settings, LogOut, User
} from 'lucide-react';

interface GuardianLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { icon: Home, label: 'Dashboard', href: '/guardian' },
    { icon: GraduationCap, label: 'My Children', href: '/guardian/children' },
    { icon: Calendar, label: 'Attendance', href: '/guardian/attendance' },
    { icon: Clock, label: 'Timetable', href: '/guardian/timetable' },
    { icon: FileText, label: 'Results', href: '/guardian/results' },
    { icon: Bell, label: 'Announcements', href: '/guardian/announcements' },
];

export default async function GuardianLayout({ children }: GuardianLayoutProps) {
    const session = await auth();

    if (!session) {
        redirect('/auth/login');
    }

    // Redirect non-guardians to their appropriate dashboard
    if (session.user.role !== 'GUARDIAN') {
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
            redirect('/admin');
        } else if (session.user.role === 'TEACHER') {
            redirect('/teacher');
        } else if (session.user.role === 'STUDENT') {
            redirect('/student');
        }
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-100">
                    <Link href="/guardian" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="font-bold text-xl text-slate-800">SchooLama</span>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">Guardian Portal</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-800 text-sm">{session.user.name}</p>
                            <p className="text-xs text-slate-500">Guardian</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/guardian/settings"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <Settings size={16} />
                            Settings
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
