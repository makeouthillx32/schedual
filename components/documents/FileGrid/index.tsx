// components/documents/FileGrid/index.tsx
'use client';

import React from 'react';
import { Folder as FolderLucide } from 'lucide-react';

// Import the individual file/folder components
import Folder from '../Folder';
import File from '../File';

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

export default function FileGrid({
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
  
  // Empty state component
  const EmptyState = () => (
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
  );

  // If no documents, show empty state
  if (documents.length === 0) {
    return (
      <div className={`documents-content ${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
          : 'space-y-2'
      } ${className}`}>
        <EmptyState />
      </div>
    );
  }

  // Render documents grid/list
  return (
    <div className={`documents-content ${
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
        : 'space-y-2'
    } ${className}`}>
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
  );
}