
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const teacher = await prisma.teacher.findFirst({
        include: { user: true }
    });

    if (teacher) {
        console.log('--- TEACHER CREDENTIALS ---');
        console.log(`Name: ${teacher.user.name}`);
        console.log(`Email: ${teacher.user.email}`);
        console.log(`Employee ID: ${teacher.employeeId}`);
        console.log(`Password: password123`);
        console.log('---------------------------');
    } else {
        console.log('No teachers found in database.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
