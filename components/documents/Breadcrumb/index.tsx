// components/documents/Breadcrumb/index.tsx
'use client';

import React from 'react';

interface BreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export default function Breadcrumb({
  currentPath,
  onNavigate,
  className = ''
}: BreadcrumbProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 ${className}`}>
      <button
        onClick={() => onNavigate('')}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a1 1 0 00-1-1H6a1 1 0 01-1-1V7a1 1 0 011-1h7l2 2h3a1 1 0 011 1z" />
        </svg>
        Home
      </button>
      
      {currentPath && currentPath.split('/').filter(Boolean).map((folder, index, array) => {
        const pathUpToHere = array.slice(0, index + 1).join('/') + '/';
        return (
          <React.Fragment key={pathUpToHere}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button
              onClick={() => onNavigate(pathUpToHere)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {folder}
            </button>
          </React.Fragment>
        );
      })}
      
      {/* Current Folder Indicator */}
      {currentPath && (
        <div className="ml-auto flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">
            You are in: {currentPath.split('/').filter(Boolean).pop() || 'Root'}
          </span>
        </div>
      )}
    </div>
  );
}