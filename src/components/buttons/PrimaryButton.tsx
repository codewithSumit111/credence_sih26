import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  variant?: 'primary' | 'green' | 'danger';
}

export default function PrimaryButton({ children, loading, size = 'md', icon, className, disabled, variant = 'primary', ...rest }: Props) {
  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }[size];

  const variantClass = {
    primary: 'bg-[#0F2240] hover:bg-[#1A3355]',
    green: 'bg-green-700 hover:bg-green-800',
    danger: 'bg-red-600 hover:bg-red-700',
  }[variant];

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center gap-2 font-semibold rounded transition-colors text-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass,
        sizeClass,
        className
      )}
    >
      {loading
        ? <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
        : icon && <span className="flex-shrink-0">{icon}</span>
      }
      {children}
    </button>
  );
}
