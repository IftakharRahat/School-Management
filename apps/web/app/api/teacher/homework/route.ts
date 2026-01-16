import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { z } from 'zod';

const createHomeworkSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    classId: z.string().min(1, 'Class is required'),
    sectionId: z.string().optional().or(z.literal('')),
    subjectId: z.string().min(1, 'Subject is required'),
    dueDate: z.string().min(1, 'Due date is required'),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const validated = createHomeworkSchema.parse(body);

        const teacher = await prisma.teacher.findFirst({
            where: { userId: session.user.id },
            select: { id: true, branchId: true }
        });

        if (!teacher) {
            return new NextResponse('Teacher profile not found', { status: 404 });
        }

        const homework = await prisma.homework.create({
            data: {
                title: validated.title,
                description: validated.description || '',
                classId: validated.classId,
                sectionId: validated.sectionId || null,
                subjectId: validated.subjectId,
                teacherId: teacher.id,
                dueDate: new Date(validated.dueDate),
            }
        });

        return NextResponse.json(homework);
    } catch (error) {
        console.error('Failed to create homework:', error);
        return new NextResponse(error instanceof z.ZodError ? error.message : 'Internal Server Error', { status: 500 });
    }
}
