import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function DangerButton({ children, size = 'md', className, ...rest }: Props) {
  const sizeClass = {
    sm: 'px-3.5 py-1.5 text-[12px]',
    md: 'px-5 py-2.5 text-[13px]',
    lg: 'px-6 py-3 text-[14px]',
  }[size];

  return (
    <button
      {...rest}
      className={clsx(
        'irctc-btn bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass,
        className
      )}
    >
      {children}
    </button>
  );
}
