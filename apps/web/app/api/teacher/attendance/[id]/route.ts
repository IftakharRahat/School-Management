import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id }
    });

    if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get section info
    const section = await prisma.section.findUnique({
        where: { id },
        include: { class: true }
    });

    if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Get students in this section
    const enrollments = await prisma.enrollment.findMany({
        where: {
            sectionId: id,
            status: 'ACTIVE'
        },
        include: {
            student: {
                include: { user: true }
            }
        },
        orderBy: { rollNumber: 'asc' }
    });

    const students = enrollments.map(e => ({
        id: e.student.id,
        name: e.student.user.name,
        admissionNo: e.student.admissionNo,
        rollNumber: e.rollNumber
    }));

    return NextResponse.json({ section, students });
}
