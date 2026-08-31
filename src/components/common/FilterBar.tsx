import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
}

export default function FilterBar({ children, onSearch, searchPlaceholder }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder ?? 'Search...'}
            onChange={e => onSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-48"
          />
        </div>
      )}
      {children}
    </div>
  );
}
