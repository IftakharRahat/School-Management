import { prisma } from './index';
import { hash } from 'bcryptjs';

async function main() {
    console.log('🌱 Seeding database...');

    // Create a tenant
    const tenant = await prisma.tenant.upsert({
        where: { domain: 'demo.schoolama.com' },
        update: {},
        create: {
            name: 'Demo School',
            domain: 'demo.schoolama.com',
            settings: {
                theme: 'default',
                language: 'en',
            },
        },
    });

    console.log('✅ Tenant created:', tenant.name);

    // Create a branch
    const branch = await prisma.branch.upsert({
        where: {
            tenantId_code: {
                tenantId: tenant.id,
                code: 'MAIN',
            }
        },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Main Campus',
            code: 'MAIN',
            address: 'Dhaka, Bangladesh',
            phone: '+880-1700-000000',
            email: 'main@demo.schoolama.com',
            isMain: true,
        },
    });

    console.log('✅ Branch created:', branch.name);

    // Create admin user
    const hashedPassword = await hash('Admin@123', 12);

    const adminUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'admin@demo.schoolama.com',
            }
        },
        update: {},
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            email: 'admin@demo.schoolama.com',
            password: hashedPassword,
            name: 'Adam Holland',
            phone: '+880-1700-000001',
            role: 'ADMIN',
            type: 'ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create teacher user
    const teacherUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'daniel@demo.schoolama.com',
            }
        },
        update: {},
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            email: 'daniel@demo.schoolama.com',
            password: hashedPassword,
            name: 'Daniel Adams',
            phone: '+880-1700-000002',
            role: 'TEACHER',
            type: 'TEACHER',
            isActive: true,
        },
    });

    console.log('✅ Teacher user created:', teacherUser.email);

    // Create teacher profile
    await prisma.teacher.upsert({
        where: { userId: teacherUser.id },
        update: {},
        create: {
            userId: teacherUser.id,
            branchId: branch.id,
            employeeId: 'TCH-001',
            designation: 'Senior Teacher',
            department: 'Science',
            qualification: 'M.Sc. Physics',
            specialization: 'Physics & Chemistry',
        },
    });

    console.log('✅ Teacher profile created');

    // Create academic year
    const academicYear = await prisma.academicYear.upsert({
        where: { id: 'default-year' },
        update: {},
        create: {
            id: 'default-year',
            branchId: branch.id,
            name: '2024-2025',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            isCurrent: true,
        },
    });

    console.log('✅ Academic year created:', academicYear.name);

    // Create classes
    const classNames = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'];
    for (let i = 0; i < classNames.length; i++) {
        const cls = await prisma.class.create({
            data: {
                branchId: branch.id,
                name: classNames[i],
                grade: i + 1,
            },
        });

        // Create sections for each class
        const sections = ['A', 'B'];
        for (const sectionName of sections) {
            await prisma.section.create({
                data: {
                    classId: cls.id,
                    name: sectionName,
                    capacity: 40,
                },
            });
        }
    }

    console.log('✅ Classes and sections created');

    // Create some announcements
    await prisma.announcement.createMany({
        data: [
            {
                branchId: branch.id,
                title: 'Picture Day Reminder',
                content: "School Picture Day is tomorrow! Don't forget to wear your full uniform and bring your best smile.",
                type: 'GENERAL',
                priority: 'NORMAL',
            },
            {
                branchId: branch.id,
                title: 'Book Fair Opening',
                content: 'The annual Book Fair will open this Thursday. Stop by the library to browse the newest books.',
                type: 'EVENT',
                priority: 'NORMAL',
            },
            {
                branchId: branch.id,
                title: 'Sports Day Postponed',
                content: 'Due to weather, Sports Day has been postponed. A new date will be announced soon.',
                type: 'EVENT',
                priority: 'HIGH',
            },
        ],
    });

    console.log('✅ Announcements created');

    console.log('\n🎉 Seeding complete!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@demo.schoolama.com / Admin@123');
    console.log('   Teacher: daniel@demo.schoolama.com / Admin@123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
