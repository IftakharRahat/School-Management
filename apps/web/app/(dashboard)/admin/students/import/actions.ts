'use server';

import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

interface BulkStudentData {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup?: string;
    address: string;
    admissionNo: string;
    admissionDate?: string;
    classId: string;
    sectionId: string;
}

interface BulkImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: { row: number; message: string }[];
}

export async function bulkImportStudents(
    students: BulkStudentData[],
    branchId: string,
    tenantId: string
): Promise<BulkImportResult> {
    const errors: { row: number; message: string }[] = [];
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const rowNum = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

        try {
            // Validate required fields
            if (!student.firstName || !student.lastName) {
                throw new Error('First name and last name are required');
            }
            if (!student.admissionNo) {
                throw new Error('Admission number is required');
            }
            if (!student.address) {
                throw new Error('Address is required');
            }
            if (!student.gender || !['MALE', 'FEMALE', 'OTHER'].includes(student.gender)) {
                throw new Error('Valid gender (MALE/FEMALE/OTHER) is required');
            }
            if (!student.classId || !student.sectionId) {
                throw new Error('Class and Section are required');
            }

            // Check if admission number already exists
            const existingStudent = await prisma.student.findFirst({
                where: {
                    branchId,
                    admissionNo: student.admissionNo,
                },
            });

            if (existingStudent) {
                throw new Error(`Admission number ${student.admissionNo} already exists`);
            }

            // Generate email if not provided
            const email = student.email || `${student.admissionNo.toLowerCase()}@student.schoolama.com`;

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: {
                    tenantId_email: { tenantId, email },
                },
            });

            if (existingUser) {
                throw new Error(`Email ${email} already exists`);
            }

            // Create user and student
            const hashedPassword = await hash('123456', 10); // Default password

            await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        tenantId,
                        name: `${student.firstName} ${student.lastName}`,
                        email,
                        phone: student.phone,
                        password: hashedPassword,
                        role: 'STUDENT',
                        type: 'STUDENT',
                    },
                });

                const newStudent = await tx.student.create({
                    data: {
                        userId: user.id,
                        branchId,
                        admissionNo: student.admissionNo,
                        admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
                        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
                        gender: student.gender,
                        bloodGroup: student.bloodGroup,
                        address: student.address,
                    },
                });

                // Get current academic year
                const academicYear = await tx.academicYear.findFirst({
                    where: { branchId, isCurrent: true },
                });

                if (academicYear) {
                    await tx.enrollment.create({
                        data: {
                            studentId: newStudent.id,
                            sectionId: student.sectionId,
                            academicYearId: academicYear.id,
                            status: 'ACTIVE',
                        },
                    });
                }
            });

            imported++;
        } catch (error: any) {
            failed++;
            errors.push({
                row: rowNum,
                message: error.message || 'Unknown error',
            });
        }
    }

    revalidatePath('/admin/students');

    return {
        success: failed === 0,
        imported,
        failed,
        errors,
    };
}

// Get classes and sections for import mapping
export async function getClassesWithSections(branchId: string) {
    return prisma.class.findMany({
        where: { branchId },
        include: {
            sections: {
                orderBy: { name: 'asc' },
            },
        },
        orderBy: { grade: 'asc' },
    });
}
