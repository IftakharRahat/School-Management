
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findFirst({
        include: { user: true }
    });

    if (student) {
        console.log(`Student Found:`);
        console.log(`Email: ${student.user.email}`);
        console.log(`Name: ${student.user.name}`);
    } else {
        console.log('No students found.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
