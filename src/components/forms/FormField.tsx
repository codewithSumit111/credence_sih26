import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}

export default function FormField({ label, required, error, children, className, hint }: Props) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
