import * as React from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
            outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
            ghost: "hover:bg-slate-100 text-slate-600",
            destructive: "bg-red-500 text-white hover:bg-red-600",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-sm",
            lg: "h-12 rounded-lg px-8",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
