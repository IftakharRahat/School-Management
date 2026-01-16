import Sidebar from '@/components/Sidebar';
import Providers from '@/components/Providers';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <div className="flex min-h-screen bg-[#f7f8fa]">
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0">
                    {children}
                </main>
            </div>
        </Providers>
    );
}
