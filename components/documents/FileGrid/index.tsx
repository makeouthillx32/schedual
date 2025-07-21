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
  fileCount?: number; // Add this for folder content count
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
  
  // Get chart color class based on index
  const getChartColorClass = (index: number): string => {
    const chartColors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
    return chartColors[index % chartColors.length];
  };
  
  const EmptyState = React.memo(() => (
    <div className="col-span-full text-center py-12">
      <FolderLucide className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">
        {searchQuery ? 'No documents found' : 'This folder is empty'}
      </p>
      {!currentPath && (
        <p className="text-muted-foreground/70 mt-2">
          Click "Upload" to add files or "New Folder" to create folders
        </p>
      )}
    </div>
  ));

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
            className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {currentPath.split('/').filter(Boolean).length > 1 
              ? currentPath.split('/').filter(Boolean).slice(-2, -1)[0] 
              : 'Home'}
          </button>
          
          <div className="text-sm text-muted-foreground">
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
          {documents.map((doc, index) => (
            doc.type === 'folder' ? (
              <Folder
                key={doc.id}
                folder={doc}
                viewMode={viewMode}
                isSelected={selectedItems.includes(doc.id)}
                isFavorite={doc.is_favorite}
                chartColorClass={getChartColorClass(index)}  // Pass the chart color class
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

export default React.memo(FileGrid, (prevProps, nextProps) => {
  return (
    prevProps.documents === nextProps.documents &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.selectedItems === nextProps.selectedItems &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.currentPath === nextProps.currentPath &&
    prevProps.className === nextProps.className
  );
});