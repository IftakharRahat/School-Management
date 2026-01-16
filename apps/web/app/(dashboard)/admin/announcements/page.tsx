import { auth } from '@/lib/auth';
import { getAnnouncements } from './actions';
import AnnouncementForm from './announcement-form';
import AnnouncementList from './announcement-list';
import { Bell } from 'lucide-react';

export default async function AnnouncementsPage() {
    const session = await auth();
    const announcements = await getAnnouncements();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Announcements</span>
                </nav>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Bell className="text-blue-600" />
                            Notice Board
                        </h1>
                        <p className="text-slate-500 mt-1">Post announcements for students, teachers, and staff.</p>
                    </div>
                    <AnnouncementForm />
                </div>
            </div>

            <AnnouncementList announcements={announcements as any} />
        </div>
    );
}
