// app/dashboard/[id]/messages/_components/ChatSidebarSearch.tsx
'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface ChatSidebarSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function ChatSidebarSearch({ searchQuery, onSearchQueryChange }: ChatSidebarSearchProps) {
  return (
    <div className="p-2 border-b">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            className="absolute inset-y-0 right-0 pr-2 flex items-center"
            onClick={() => onSearchQueryChange('')}
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}