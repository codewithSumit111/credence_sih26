import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export default function SecondaryButton({ children, size = 'md', icon, className, ...rest }: Props) {
  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }[size];

  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex items-center gap-2 font-semibold rounded border border-gray-300 bg-white text-gray-700',
        'hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass,
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
