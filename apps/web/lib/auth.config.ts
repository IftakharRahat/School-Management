import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.type = user.type;
                token.tenantId = user.tenantId;
                token.branchId = user.branchId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
                session.user.type = token.type as any;
                session.user.tenantId = token.tenantId as string;
                session.user.branchId = token.branchId as string | null;
            }
            return session;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
