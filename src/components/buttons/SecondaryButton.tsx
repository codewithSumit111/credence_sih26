import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  variant?: 'outline' | 'ghost' | 'blue';
}

export default function SecondaryButton({
  children, size = 'md', icon, className, variant = 'outline', ...rest
}: Props) {
  const sizeClass = {
    sm: 'px-3.5 py-1.5 text-[12px]',
    md: 'px-5 py-2.5 text-[13px]',
    lg: 'px-6 py-3 text-[14px]',
  }[size];

  const variantClass = {
    outline: 'irctc-btn-outline',
    ghost:   'irctc-btn-ghost',
    blue:    'irctc-btn-blue',
  }[variant];

  return (
    <button
      {...rest}
      className={clsx(
        'irctc-btn',
        variantClass,
        sizeClass,
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
