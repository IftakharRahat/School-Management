import 'next-auth';
import { Role, UserType } from '@prisma/client';

declare module 'next-auth' {
    interface User {
        id: string;
        role: Role;
        type: UserType;
        tenantId: string;
        branchId: string | null;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            role: string;
            type: string;
            tenantId: string;
            branchId: string | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        type: string;
        tenantId: string;
        branchId: string | null;
    }
}
