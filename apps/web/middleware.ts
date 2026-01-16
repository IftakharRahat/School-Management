import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/register');
    const isPublicPage = req.nextUrl.pathname === '/' ||
        req.nextUrl.pathname.startsWith('/api/auth');

    // Redirect to login if not authenticated (except for auth pages and public pages)
    if (!isLoggedIn && !isAuthPage && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirect to dashboard if trying to access auth pages while logged in
    if (isLoggedIn && isAuthPage) {
        const role = req.auth?.user?.role?.toLowerCase();
        const dashboardPath = role === 'admin' ? '/admin' :
            role === 'teacher' ? '/teacher' :
                role === 'parent' ? '/parent' :
                    role === 'student' ? '/student' : '/teacher';
        return NextResponse.redirect(new URL(dashboardPath, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
