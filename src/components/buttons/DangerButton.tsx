import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function DangerButton({ children, size = 'md', className, ...rest }: Props) {
  const sizeClass = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }[size];
  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex items-center gap-2 font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50',
        sizeClass, className
      )}
    >
      {children}
    </button>
  );
}
