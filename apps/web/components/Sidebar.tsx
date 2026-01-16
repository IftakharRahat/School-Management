'use client';

import React from 'react';
import {
    Home, Users, UserCheck, UserPlus, BookOpen, GraduationCap,
    Library, FileText, CheckCircle, Calendar, MessageSquare,
    Megaphone, User, Settings, LogOut, ClipboardList, Wallet, Bus,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/lib/language-context';

interface NavItem {
    icon: React.ReactNode;
    labelKey: string;
    basePath: string;
    roles?: string[]; // If undefined, available to all roles
}

// All menu items with role restrictions
const ALL_MENU_ITEMS: NavItem[] = [
    { icon: <Home size={20} />, labelKey: 'nav.home', basePath: '' },
    { icon: <Users size={20} />, labelKey: 'nav.teachers', basePath: '/teachers', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { icon: <UserCheck size={20} />, labelKey: 'nav.students', basePath: '/students', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'TEACHER'] },
    { icon: <UserPlus size={20} />, labelKey: 'nav.parents', basePath: '/guardians', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { icon: <Users size={20} />, labelKey: 'nav.staff', basePath: '/staff', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { icon: <BookOpen size={20} />, labelKey: 'nav.subjects', basePath: '/subjects', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'TEACHER'] },
    { icon: <GraduationCap size={20} />, labelKey: 'nav.classes', basePath: '/classes', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'TEACHER'] },
    { icon: <Library size={20} />, labelKey: 'nav.lessons', basePath: '/lessons', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'TEACHER'] },
    { icon: <Library size={20} />, labelKey: 'nav.library', basePath: '/library', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'STUDENT'] },
    { icon: <Bus size={20} />, labelKey: 'nav.transport', basePath: '/transport', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { icon: <FileText size={20} />, labelKey: 'nav.exams', basePath: '/exams', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'TEACHER'] },
    { icon: <ClipboardList size={20} />, labelKey: 'nav.assignments', basePath: '/homework' }, // All roles
    { icon: <CheckCircle size={20} />, labelKey: 'nav.results', basePath: '/results' }, // All roles
    { icon: <Calendar size={20} />, labelKey: 'nav.timetable', basePath: '/timetable' }, // All roles
    { icon: <Calendar size={20} />, labelKey: 'nav.attendance', basePath: '/attendance' }, // All roles
    { icon: <Calendar size={20} />, labelKey: 'nav.events', basePath: '/events' }, // All roles
    { icon: <MessageSquare size={20} />, labelKey: 'nav.messages', basePath: '/messages', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'TEACHER'] },
    { icon: <Megaphone size={20} />, labelKey: 'nav.announcements', basePath: '/announcements' }, // All roles
    { icon: <UserPlus size={20} />, labelKey: 'nav.admissions', basePath: '/admissions', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { icon: <Wallet size={20} />, labelKey: 'nav.finance', basePath: '/finance/heads', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { icon: <BarChart3 size={20} />, labelKey: 'nav.reports', basePath: '/reports', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
];

const OTHER_ITEMS: NavItem[] = [
    { icon: <User size={20} />, labelKey: 'nav.profile', basePath: '/profile' },
    { icon: <Settings size={20} />, labelKey: 'nav.settings', basePath: '/settings', roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { data: session } = useSession();

    // Determine base route based on user role
    const userRole = session?.user?.role || 'STUDENT';
    const rolePrefix = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'BRANCH_ADMIN'
        ? '/admin'
        : userRole === 'TEACHER'
            ? '/teacher'
            : userRole === 'PARENT'
                ? '/parent'
                : '/student';

    // Filter menu items based on user role
    const menuItems = ALL_MENU_ITEMS.filter(item =>
        !item.roles || item.roles.includes(userRole)
    );

    const otherItems = OTHER_ITEMS.filter(item =>
        !item.roles || item.roles.includes(userRole)
    );

    const getPath = (basePath: string) => {
        if (basePath === '') return rolePrefix;
        return `${rolePrefix}${basePath}`;
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
    };

    return (
        <aside className="w-[220px] min-h-screen bg-white border-r border-slate-100 flex flex-col print:hidden">
            {/* Logo */}
            <div className="h-16 flex items-center px-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white bg-blue-600 w-7 h-7 rounded-lg flex items-center justify-center">
                        S
                    </span>
                    <span className="font-bold text-slate-800">SchooLama</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    MENU
                </p>
                {menuItems.map((item, index) => {
                    const path = getPath(item.basePath);
                    const isActive = item.basePath === ''
                        ? pathname === path
                        : pathname === path || pathname.startsWith(path + '/');

                    return (
                        <Link
                            key={index}
                            href={path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {item.icon}
                            <span>{t(item.labelKey)}</span>
                        </Link>
                    );
                })}

                {/* Other Section */}
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-3">
                    OTHER
                </p>
                {otherItems.map((item, index) => {
                    const path = getPath(item.basePath);
                    const isActive = pathname === path;

                    return (
                        <Link
                            key={index}
                            href={path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {item.icon}
                            <span>{t(item.labelKey)}</span>
                        </Link>
                    );
                })}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all mt-2"
                >
                    <LogOut size={20} />
                    <span>{t('nav.logout')}</span>
                </button>
            </nav>

            {/* Language Toggle */}
            <div className="p-4 border-t border-slate-100">
                <LanguageToggle />
            </div>
        </aside>
    );
}
