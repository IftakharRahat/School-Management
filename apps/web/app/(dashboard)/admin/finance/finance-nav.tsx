'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Grid3X3, Wallet, BarChart3 } from 'lucide-react';

const FINANCE_TABS = [
    { href: '/admin/finance/heads', label: 'Fee Heads', icon: Settings },
    { href: '/admin/finance/structure', label: 'Fee Structure', icon: Grid3X3 },
    { href: '/admin/finance/collect', label: 'Collect Fees', icon: Wallet },
    { href: '/admin/finance/reports', label: 'Reports', icon: BarChart3 },
];

export default function FinanceNav() {
    const pathname = usePathname();

    return (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6">
            {FINANCE_TABS.map((tab) => {
                const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${isActive
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }`}
                    >
                        <Icon size={16} />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
