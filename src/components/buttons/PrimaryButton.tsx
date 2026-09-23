import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  variant?: 'primary' | 'blue' | 'green' | 'danger';
}

export default function PrimaryButton({
  children, loading, size = 'md', icon, className,
  disabled, variant = 'primary', ...rest
}: Props) {
  const sizeClass = {
    sm: 'px-3.5 py-1.5 text-[12px]',
    md: 'px-5 py-2.5 text-[13px]',
    lg: 'px-6 py-3 text-[14px]',
  }[size];

  const variantClass = {
    primary: 'irctc-btn-primary',
    blue:    'irctc-btn-blue',
    green:   'bg-green-700 hover:bg-green-800 text-white shadow-sm hover:shadow-md',
    danger:  'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
  }[variant];

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        'irctc-btn',
        variantClass,
        sizeClass,
        className
      )}
    >
      {loading
        ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
        : icon && <span className="flex-shrink-0">{icon}</span>
      }
      {children}
    </button>
  );
}
