import * as React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    change?: string;
    color?: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'cyan';
    className?: string;
}

const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
    ({ icon: Icon, label, value, change, color = 'blue', className }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white rounded-2xl p-6 shadow-sm border border-slate-100',
                    className
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', colorClasses[color])}>
                        <Icon size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-slate-800">{value}</div>
                        <div className="text-sm text-slate-500">{label}</div>
                    </div>
                    {change && (
                        <div className={cn(
                            'text-sm font-medium px-2 py-1 rounded-lg',
                            change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        )}>
                            {change}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
StatCard.displayName = 'StatCard';

export { StatCard };
