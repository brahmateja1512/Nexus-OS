import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-zinc-100 text-zinc-900 hover:bg-white font-semibold shadow-sm border border-zinc-200/20',
    secondary:
      'bg-surface-subtle hover:bg-surface-hover text-text-main border border-border hover:border-zinc-600/50 shadow-sm',
    outline:
      'bg-transparent border border-border hover:border-zinc-500 text-text-main hover:bg-surface-hover',
    ghost:
      'bg-transparent hover:bg-surface-hover text-text-muted hover:text-text-main',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30',
    glow:
      'bg-zinc-100 text-zinc-950 hover:bg-white font-semibold shadow-sm hover:shadow-md border border-white/20',
  };

  const sizes = {
    xs: 'text-xs px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 font-medium',
    lg: 'text-sm px-4 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
