// components/Docustore/Folder/index.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { FolderIcon, StarIcon, MoreVerticalIcon, ChevronRightIcon } from './icons';
import { DocumentItem } from '@/hooks/useDocuments';

interface FolderProps {
  folder: DocumentItem;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  isFavorite?: boolean;
  onNavigate?: (path: string) => void;
  onToggleFavorite?: (folderPath: string, folderName: string) => void;
  onContextMenu?: (e: React.MouseEvent, folderId: string) => void;
  onSelect?: (folderId: string, isMultiSelect?: boolean) => void;
  className?: string;
}

export default function Folder({
  folder,
  viewMode = 'grid',
  isSelected = false,
  isFavorite = false,
  onNavigate,
  onToggleFavorite,
  onContextMenu,
  onSelect,
  className = ''
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Handle folder click for navigation
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('.folder-actions')) {
      return;
    }

    onNavigate?.(folder.path);
  }, [folder.path, onNavigate]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, folder.id);
  }, [folder.id, onContextMenu]);

  // Handle selection
  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect?.(folder.id, isMultiSelect);
  }, [folder.id, onSelect]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(folder.path, folder.name);
  }, [folder.path, folder.name, onToggleFavorite]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Grid view rendering
  if (viewMode === 'grid') {
    return (
      <div
        className={`folder-grid group relative cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        } ${className}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Grid Card */}
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
          
          {/* Folder Icon with Favorite Indicator */}
          <div className="relative mb-3">
            <FolderIcon 
              className={`h-12 w-12 ${isFavorite ? 'text-yellow-500' : 'text-blue-500'}`}
              isFavorite={isFavorite}
            />
            {isFavorite && (
              <StarIcon className="absolute -right-1 -top-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>

          {/* Folder Name */}
          <h3 
            className="mb-2 w-full truncate text-sm font-medium text-gray-900 dark:text-white" 
            title={folder.name}
          >
            {folder.name}
          </h3>

          {/* Metadata */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div>{formatDate(folder.created_at)}</div>
            {folder.uploader_name && (
              <div className="mt-1">by {folder.uploader_name}</div>
            )}
          </div>

          {/* Tags */}
          {folder.tags && folder.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {folder.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
              {folder.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{folder.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Action Buttons (Show on Hover) */}
          <div className={`folder-actions absolute right-2 top-2 flex gap-1 transition-opacity ${
            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleToggleFavorite}
              className="rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <StarIcon 
                className={`h-3 w-3 ${
                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                }`}
              />
            </button>
            
            <button
              onClick={handleContextMenu}
              className="rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="More options"
            >
              <MoreVerticalIcon className="h-3 w-3 text-gray-400" />
            </button>
          </div>

          {/* Selection Checkbox */}
          {(isHovered || isSelected) && (
            <div className="absolute left-2 top-2">
              <button
                onClick={handleSelect}
                className="rounded border-2 border-gray-300 bg-white p-0.5 transition-colors hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
              >
                <div className={`h-3 w-3 rounded ${
                  isSelected ? 'bg-blue-500' : 'bg-transparent'
                }`} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view rendering
  return (
    <div
      className={`folder-list group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${className}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {(isHovered || isSelected) && (
        <button
          onClick={handleSelect}
          className="rounded border-2 border-gray-300 bg-white p-0.5 transition-colors hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
        >
          <div className={`h-3 w-3 rounded ${
            isSelected ? 'bg-blue-500' : 'bg-transparent'
          }`} />
        </button>
      )}

      {/* Folder Icon */}
      <div className="flex-shrink-0">
        <FolderIcon 
          className={`h-6 w-6 ${isFavorite ? 'text-yellow-500' : 'text-blue-500'}`}
          isFavorite={isFavorite}
        />
      </div>

      {/* Folder Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-gray-900 dark:text-white">
            {folder.name}
          </h3>
          {isFavorite && (
            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        
        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(folder.created_at)}</span>
          {folder.uploader_name && (
            <span>by {folder.uploader_name}</span>
          )}
          {folder.tags && folder.tags.length > 0 && (
            <span>{folder.tags.length} tag{folder.tags.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Navigate Icon */}
      <div className="flex-shrink-0">
        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div className={`folder-actions flex gap-1 transition-opacity ${
        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={handleToggleFavorite}
          className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <StarIcon 
            className={`h-4 w-4 ${
              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            }`}
          />
        </button>
        
        <button
          onClick={handleContextMenu}
          className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          title="More options"
        >
          <MoreVerticalIcon className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}