import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface MapSearchProps {
  onSearch: (query: string) => void;
}

export default function MapSearch({ onSearch }: MapSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="absolute top-4 left-14 z-[400] bg-white border border-irctc-border rounded-lg shadow-irctc-sm overflow-hidden flex items-center h-10 w-64">
      <form onSubmit={handleSubmit} className="flex-1 flex h-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search block, station, corridor..."
          className="flex-1 px-3 py-2 text-[12px] outline-none text-irctc-navy"
        />
        <button type="submit" className="px-3 text-gray-500 hover:text-irctc-blue transition-colors flex items-center justify-center bg-gray-50 border-l border-gray-100">
          <Search className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
