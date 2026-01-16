import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';


const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const notoBengali = Noto_Sans_Bengali({
    subsets: ['bengali'],
    variable: '--font-bengali',
    weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'SchooLama - School Management System',
    description: 'A comprehensive school management system designed for Bangladesh education',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${notoBengali.variable} font-sans`}>
                {children}
            </body>
        </html>
    );
}
