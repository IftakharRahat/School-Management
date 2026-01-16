import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@repo/database';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const { email, password } = loginSchema.parse(credentials);

                    const user = await prisma.user.findFirst({
                        where: { email },
                        include: {
                            tenant: true,
                            branch: true,
                            student: true,
                            teacher: true,
                            staff: true,
                        },
                    });

                    if (!user) {
                        return null;
                    }

                    const isValidPassword = await compare(password, user.password);

                    if (!isValidPassword) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        type: user.type,
                        tenantId: user.tenantId,
                        branchId: user.branchId,
                        image: user.avatar,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
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
                session.user.role = token.role as string;
                session.user.type = token.type as string;
                session.user.tenantId = token.tenantId as string;
                session.user.branchId = token.branchId as string | null;
            }
            return session;
        },
    },
});
