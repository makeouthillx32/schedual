// components/documents/FileGrid/index.tsx
'use client';

import React from 'react';
import { Folder as FolderLucide } from 'lucide-react';

// Import the individual file/folder components
import Folder from '../Folder';
import File from '../File';
import Breadcrumb from '../Breadcrumb';

interface DocumentItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  mime_type?: string;
}

interface FileGridProps {
  documents: DocumentItem[];
  viewMode: 'grid' | 'list';
  selectedItems: string[];
  searchQuery?: string;
  currentPath?: string;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onNavigate: (path: string) => void;
  onAddFavorite: (path: string, name: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string, isMulti: boolean) => void;
  className?: string;
}

function FileGrid({
  documents,
  viewMode,
  selectedItems,
  searchQuery,
  currentPath,
  onPreview,
  onDownload,
  onToggleFavorite,
  onNavigate,
  onAddFavorite,
  onContextMenu,
  onSelect,
  className = ''
}: FileGridProps) {
  
  // Empty state component - memoized to prevent re-renders
  const EmptyState = React.memo(() => (
    <div className="col-span-full text-center py-12">
      <FolderLucide className="mx-auto w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-500">
        {searchQuery ? 'No documents found' : 'This folder is empty'}
      </p>
      {!currentPath && (
        <p className="text-gray-400 mt-2">
          Click "Upload" to add files or "New Folder" to create folders
        </p>
      )}
    </div>
  ));

  // Memoized grid container classes to prevent recalculation
  const gridClasses = React.useMemo(() => {
    return `documents-content ${
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
        : 'space-y-2'
    }`;
  }, [viewMode]);

  return (
    <div className={`file-grid-container space-y-6 ${className}`}>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        currentPath={currentPath || ''}
        onNavigate={onNavigate}
      />

      {/* Quick Back Button & Stats */}
      {currentPath && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const pathParts = currentPath.split('/').filter(Boolean);
              const parentPath = pathParts.length > 1 
                ? pathParts.slice(0, -1).join('/') + '/'
                : '';
              onNavigate(parentPath);
            }}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {currentPath.split('/').filter(Boolean).length > 1 
              ? currentPath.split('/').filter(Boolean).slice(-2, -1)[0] 
              : 'Home'}
          </button>
          
          <div className="text-sm text-gray-500">
            {documents.length} item{documents.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* File Grid */}
      {documents.length === 0 ? (
        <div className={gridClasses}>
          <EmptyState />
        </div>
      ) : (
        <div className={gridClasses}>
          {documents.map((doc) => (
            doc.type === 'folder' ? (
              <Folder
                key={doc.id}
                folder={doc}
                viewMode={viewMode}
                isSelected={selectedItems.includes(doc.id)}
                isFavorite={doc.is_favorite}
                onNavigate={onNavigate}
                onToggleFavorite={(path, name) => onAddFavorite(path, name)}
                onContextMenu={onContextMenu}
                onSelect={onSelect}
              />
            ) : (
              <File
                key={doc.id}
                file={doc}
                viewMode={viewMode}
                isSelected={selectedItems.includes(doc.id)}
                isFavorite={doc.is_favorite}
                onPreview={() => onPreview(doc.id)}
                onDownload={() => onDownload(doc.id)}
                onToggleFavorite={() => onToggleFavorite(doc.id)}
                onContextMenu={onContextMenu}
                onSelect={onSelect}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

// Wrap in React.memo to prevent unnecessary re-renders
// Only re-renders when props actually change
export default React.memo(FileGrid, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.documents === nextProps.documents &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.selectedItems === nextProps.selectedItems &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.currentPath === nextProps.currentPath &&
    prevProps.className === nextProps.className
  );
});