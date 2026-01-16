import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const teacher = await prisma.teacher.findFirst({
            where: { userId: session.user.id },
            select: { id: true, branchId: true }
        });

        if (!teacher) {
            return new NextResponse('Teacher profile not found', { status: 404 });
        }

        const [classes, subjects] = await Promise.all([
            prisma.class.findMany({
                where: { branchId: teacher.branchId },
                include: {
                    sections: {
                        orderBy: { name: 'asc' }
                    }
                },
                orderBy: { grade: 'asc' }
            }),
            prisma.subject.findMany({
                where: {
                    class: {
                        branchId: teacher.branchId
                    }
                },
                orderBy: { name: 'asc' }
            })
        ]);

        return NextResponse.json({
            classes: classes.map(c => ({
                id: c.id,
                name: c.name,
                sections: c.sections.map(s => ({ id: s.id, name: s.name }))
            })),
            subjects: subjects.map(s => ({
                id: s.id,
                name: s.name,
                code: s.code
            }))
        });
    } catch (error) {
        console.error('Failed to fetch homework options:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
