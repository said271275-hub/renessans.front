import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'inset' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-[12px] gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-[16px] gap-2',
    lg: 'text-base px-6 py-3.5 rounded-[20px] gap-2.5',
  }[size];

  const variantClasses = {
    default: 'neu-button text-[var(--text-primary)]',
    primary: 'neu-button text-[var(--accent)] font-bold border border-[var(--border-subtle)]',
    danger: 'neu-button text-red-600 dark:text-red-400 font-medium',
    success: 'neu-button text-emerald-600 dark:text-emerald-400 font-medium',
    inset: 'neu-inset text-[var(--text-primary)] font-semibold shadow-[var(--shadow-inset)]',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] rounded-[14px]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 select-none ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
