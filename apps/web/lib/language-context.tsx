'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.teachers': 'Teachers',
        'nav.students': 'Students',
        'nav.parents': 'Parents',
        'nav.staff': 'Staff',
        'nav.subjects': 'Subjects',
        'nav.classes': 'Classes',
        'nav.lessons': 'Lessons',
        'nav.library': 'Library',
        'nav.transport': 'Transport',
        'nav.exams': 'Exams',
        'nav.assignments': 'Assignments',
        'nav.results': 'Results',
        'nav.timetable': 'Timetable',
        'nav.attendance': 'Attendance',
        'nav.events': 'Events',
        'nav.messages': 'Messages',
        'nav.announcements': 'Announcements',
        'nav.admissions': 'Admissions',
        'nav.finance': 'Finance',
        'nav.reports': 'Reports',
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        'nav.logout': 'Logout',

        // Dashboard
        'dashboard.welcome': 'Welcome back',
        'dashboard.schedule': "Teacher's Schedule",
        'dashboard.shortcuts': 'Shortcuts',
        'dashboard.performance': 'Performance',
        'dashboard.announcements': 'Announcements',
        'dashboard.viewAll': 'View All',

        // Stats
        'stats.attendance': 'Attendance',
        'stats.branches': 'Branches',
        'stats.lessons': 'Lessons',
        'stats.classes': 'Classes',
        'stats.students': 'Total Students',
        'stats.teachers': 'Total Teachers',
        'stats.feeCollection': 'Fee Collection',

        // Common
        'common.search': 'Search...',
        'common.bloodGroup': 'Blood Group',
        'common.signIn': 'Sign In',
        'common.email': 'Email Address',
        'common.password': 'Password',
        'common.rememberMe': 'Remember me',
        'common.forgotPassword': 'Forgot password?',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.create': 'Create',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.noData': 'No data available',

        // Pages - Teacher
        'page.mySubjects': 'My Subjects',
        'page.myClasses': 'My Classes',
        'page.myStudents': 'My Students',
        'page.myLessons': 'My Lessons',
        'page.takeAttendance': 'Take Attendance',
        'page.enterResults': 'Enter Results',
        'page.createAssignment': 'Create Assignment',
        'page.viewSubmissions': 'View Submissions',
        'page.teacherProfile': 'My Profile',
        'page.teachingSchedule': 'My Teaching Schedule',

        // Pages - Student
        'page.myTimetable': 'My Timetable',
        'page.myResults': 'My Results',
        'page.myAttendance': 'My Attendance',
        'page.myHomework': 'My Homework',
        'page.myLibrary': 'My Library',
        'page.studentProfile': 'My Profile',
        'page.upcomingEvents': 'Upcoming Events',
        'page.schoolAnnouncements': 'School Announcements',

        // Attendance
        'attendance.present': 'Present',
        'attendance.absent': 'Absent',
        'attendance.late': 'Late',
        'attendance.saveAttendance': 'Save Attendance',
        'attendance.students': 'Students',

        // Homework
        'homework.title': 'Title',
        'homework.description': 'Description',
        'homework.dueDate': 'Due Date',
        'homework.submissions': 'Submissions',
        'homework.graded': 'Graded',
        'homework.pending': 'Pending',
        'homework.pastDue': 'Past Due',
    },
    bn: {
        // Navigation
        'nav.home': 'হোম',
        'nav.teachers': 'শিক্ষক',
        'nav.students': 'শিক্ষার্থী',
        'nav.parents': 'অভিভাবক',
        'nav.staff': 'স্টাফ',
        'nav.subjects': 'বিষয়',
        'nav.classes': 'শ্রেণি',
        'nav.lessons': 'পাঠ',
        'nav.library': 'লাইব্রেরি',
        'nav.transport': 'পরিবহন',
        'nav.exams': 'পরীক্ষা',
        'nav.assignments': 'অ্যাসাইনমেন্ট',
        'nav.results': 'ফলাফল',
        'nav.timetable': 'সময়সূচি',
        'nav.attendance': 'উপস্থিতি',
        'nav.events': 'ইভেন্ট',
        'nav.messages': 'বার্তা',
        'nav.announcements': 'ঘোষণা',
        'nav.admissions': 'ভর্তি',
        'nav.finance': 'অর্থ',
        'nav.reports': 'রিপোর্ট',
        'nav.profile': 'প্রোফাইল',
        'nav.settings': 'সেটিংস',
        'nav.logout': 'লগআউট',

        // Dashboard
        'dashboard.welcome': 'স্বাগতম',
        'dashboard.schedule': 'শিক্ষকের সময়সূচি',
        'dashboard.shortcuts': 'শর্টকাট',
        'dashboard.performance': 'পারফরম্যান্স',
        'dashboard.announcements': 'ঘোষণা',
        'dashboard.viewAll': 'সব দেখুন',

        // Stats
        'stats.attendance': 'উপস্থিতি',
        'stats.branches': 'শাখা',
        'stats.lessons': 'পাঠ',
        'stats.classes': 'শ্রেণি',
        'stats.students': 'মোট শিক্ষার্থী',
        'stats.teachers': 'মোট শিক্ষক',
        'stats.feeCollection': 'ফি সংগ্রহ',

        // Common
        'common.search': 'অনুসন্ধান...',
        'common.bloodGroup': 'রক্তের গ্রুপ',
        'common.signIn': 'সাইন ইন',
        'common.email': 'ইমেইল',
        'common.password': 'পাসওয়ার্ড',
        'common.rememberMe': 'মনে রাখুন',
        'common.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
        'common.save': 'সংরক্ষণ',
        'common.cancel': 'বাতিল',
        'common.create': 'তৈরি করুন',
        'common.edit': 'সম্পাদনা',
        'common.delete': 'মুছুন',
        'common.back': 'পেছনে',
        'common.loading': 'লোড হচ্ছে...',
        'common.noData': 'কোনো তথ্য নেই',

        // Pages - Teacher
        'page.mySubjects': 'আমার বিষয়',
        'page.myClasses': 'আমার শ্রেণি',
        'page.myStudents': 'আমার শিক্ষার্থী',
        'page.myLessons': 'আমার পাঠ',
        'page.takeAttendance': 'উপস্থিতি নিন',
        'page.enterResults': 'ফলাফল লিখুন',
        'page.createAssignment': 'অ্যাসাইনমেন্ট তৈরি',
        'page.viewSubmissions': 'সাবমিশন দেখুন',
        'page.teacherProfile': 'আমার প্রোফাইল',
        'page.teachingSchedule': 'আমার পাঠদান সময়সূচি',

        // Pages - Student
        'page.myTimetable': 'আমার সময়সূচি',
        'page.myResults': 'আমার ফলাফল',
        'page.myAttendance': 'আমার উপস্থিতি',
        'page.myHomework': 'আমার হোমওয়ার্ক',
        'page.myLibrary': 'আমার লাইব্রেরি',
        'page.studentProfile': 'আমার প্রোফাইল',
        'page.upcomingEvents': 'আসন্ন ইভেন্ট',
        'page.schoolAnnouncements': 'স্কুল ঘোষণা',

        // Attendance
        'attendance.present': 'উপস্থিত',
        'attendance.absent': 'অনুপস্থিত',
        'attendance.late': 'বিলম্বে',
        'attendance.saveAttendance': 'উপস্থিতি সংরক্ষণ',
        'attendance.students': 'শিক্ষার্থী',

        // Homework
        'homework.title': 'শিরোনাম',
        'homework.description': 'বিবরণ',
        'homework.dueDate': 'জমা দেওয়ার তারিখ',
        'homework.submissions': 'জমা',
        'homework.graded': 'গ্রেড দেওয়া হয়েছে',
        'homework.pending': 'মুলতুবি',
        'homework.pastDue': 'সময় পেরিয়ে গেছে',
    },
};


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load language preference from localStorage
        const savedLang = localStorage.getItem('schoolama-language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'bn')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('schoolama-language', lang);
        // Update document direction for Bengali (if needed in future)
        document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
