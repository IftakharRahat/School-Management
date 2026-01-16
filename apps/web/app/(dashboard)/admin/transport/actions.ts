'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Routes
export async function getRoutes() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.transportRoute.findMany({
        where: { branchId: session.user.branchId },
        include: {
            vehicle: true,
            _count: { select: { students: true } },
        },
        orderBy: { name: 'asc' },
    });
}

const routeSchema = z.object({
    name: z.string().min(1),
    startPoint: z.string().min(1),
    endPoint: z.string().min(1),
    stops: z.string().optional(),
    distance: z.number().optional(),
    duration: z.number().optional(),
    fare: z.number().optional(),
});

export async function createRoute(data: z.infer<typeof routeSchema>) {
    const session = await auth();
    if (!session?.user?.branchId) return { error: 'Unauthorized' };

    try {
        await prisma.transportRoute.create({
            data: {
                branchId: session.user.branchId,
                name: data.name,
                startPoint: data.startPoint,
                endPoint: data.endPoint,
                stops: data.stops || null,
                distance: data.distance || null,
                duration: data.duration || null,
                fare: data.fare || null,
            },
        });
        revalidatePath('/admin/transport');
        return { success: true };
    } catch (error: any) {
        if (error?.code === 'P2002') return { error: 'Route name already exists' };
        return { error: 'Failed to create route' };
    }
}

export async function deleteRoute(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.transportRoute.delete({ where: { id } });
        revalidatePath('/admin/transport');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete route' };
    }
}

// Vehicles
export async function getVehicles() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.vehicle.findMany({
        where: { branchId: session.user.branchId },
        include: { route: { select: { name: true } } },
        orderBy: { registrationNo: 'asc' },
    });
}

const vehicleSchema = z.object({
    registrationNo: z.string().min(1),
    type: z.enum(['BUS', 'MINIBUS', 'VAN', 'MICROBUS']).default('BUS'),
    capacity: z.number().min(1),
    driverName: z.string().min(1),
    driverPhone: z.string().min(1),
    driverLicense: z.string().optional(),
    routeId: z.string().optional(),
});

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
    const session = await auth();
    if (!session?.user?.branchId) return { error: 'Unauthorized' };

    try {
        await prisma.vehicle.create({
            data: {
                branchId: session.user.branchId,
                registrationNo: data.registrationNo,
                type: data.type as any,
                capacity: data.capacity,
                driverName: data.driverName,
                driverPhone: data.driverPhone,
                driverLicense: data.driverLicense || null,
                routeId: data.routeId || null,
            },
        });
        revalidatePath('/admin/transport');
        return { success: true };
    } catch (error: any) {
        if (error?.code === 'P2002') return { error: 'Vehicle already registered' };
        return { error: 'Failed to add vehicle' };
    }
}

export async function deleteVehicle(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.vehicle.delete({ where: { id } });
        revalidatePath('/admin/transport');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete' };
    }
}

// Student Assignments
export async function getStudentTransportAssignments() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.studentTransport.findMany({
        where: { route: { branchId: session.user.branchId }, isActive: true },
        include: {
            student: { include: { user: { select: { name: true } } } },
            route: { select: { name: true, fare: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function assignStudentToRoute(studentId: string, routeId: string, pickupPoint: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.studentTransport.upsert({
            where: { studentId_routeId: { studentId, routeId } },
            update: { pickupPoint, isActive: true },
            create: { studentId, routeId, pickupPoint },
        });
        revalidatePath('/admin/transport');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to assign student' };
    }
}

export async function removeStudentFromRoute(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await prisma.studentTransport.update({
            where: { id },
            data: { isActive: false, endDate: new Date() },
        });
        revalidatePath('/admin/transport');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to remove' };
    }
}

// Students for dropdown
export async function getStudentsForTransport() {
    const session = await auth();
    if (!session?.user?.branchId) return [];

    return prisma.student.findMany({
        where: { branchId: session.user.branchId },
        select: { id: true, admissionNo: true, user: { select: { name: true } } },
        orderBy: { user: { name: 'asc' } },
    });
}
