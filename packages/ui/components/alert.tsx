import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; icon: React.ReactNode }> = {
    info: {
        container: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: <Info className="w-5 h-5 text-blue-500" />,
    },
    success: {
        container: 'bg-green-50 border-green-200 text-green-800',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    warning: {
        container: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    error: {
        container: 'bg-red-50 border-red-200 text-red-800',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'info', title, children, dismissible, onDismiss, ...props }, ref) => {
        const styles = variantStyles[variant];

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    'relative flex gap-3 rounded-xl border p-4',
                    styles.container,
                    className
                )}
                {...props}
            >
                <div className="shrink-0">{styles.icon}</div>
                <div className="flex-1">
                    {title && <p className="font-semibold mb-1">{title}</p>}
                    <div className="text-sm">{children}</div>
                </div>
                {dismissible && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }
);
Alert.displayName = 'Alert';

export { Alert };
