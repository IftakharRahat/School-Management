import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    // Redirect based on user role
    const role = session.user?.role?.toLowerCase();

    switch (role) {
        case 'super_admin':
        case 'admin':
        case 'branch_admin':
            redirect('/admin');
        case 'teacher':
        case 'head_teacher':
            redirect('/teacher');
        case 'parent':
            redirect('/parent');
        case 'student':
            redirect('/student');
        default:
            redirect('/teacher');
    }
}
