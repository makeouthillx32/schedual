// components/Docustore/File/index.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { 
  FileIcon, 
  ImageIcon, 
  PdfIcon, 
  WordIcon, 
  ExcelIcon, 
  PowerPointIcon,
  VideoIcon,
  AudioIcon,
  ArchiveIcon,
  CodeIcon,
  StarIcon, 
  MoreVerticalIcon, 
  DownloadIcon,
  EyeIcon,
  ShareIcon
} from './icons';
import { DocumentItem } from '@/hooks/useDocuments';

interface FileProps {
  file: DocumentItem;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  isFavorite?: boolean;
  onPreview?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  onToggleFavorite?: (fileId: string) => void;
  onContextMenu?: (e: React.MouseEvent, fileId: string) => void;
  onSelect?: (fileId: string, isMultiSelect?: boolean) => void;
  className?: string;
}

export default function File({
  file,
  viewMode = 'grid',
  isSelected = false,
  isFavorite = false,
  onPreview,
  onDownload,
  onToggleFavorite,
  onContextMenu,
  onSelect,
  className = ''
}: FileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get appropriate icon based on MIME type
  const getFileIcon = useCallback(() => {
    if (!file.mime_type) return <FileIcon className="h-full w-full" />;

    const mimeType = file.mime_type.toLowerCase();
    const iconProps = { className: "h-full w-full" };

    if (mimeType.startsWith('image/')) return <ImageIcon {...iconProps} />;
    if (mimeType.includes('pdf')) return <PdfIcon {...iconProps} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <WordIcon {...iconProps} />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <ExcelIcon {...iconProps} />;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <PowerPointIcon {...iconProps} />;
    if (mimeType.startsWith('video/')) return <VideoIcon {...iconProps} />;
    if (mimeType.startsWith('audio/')) return <AudioIcon {...iconProps} />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <ArchiveIcon {...iconProps} />;
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return <CodeIcon {...iconProps} />;

    return <FileIcon {...iconProps} />;
  }, [file.mime_type]);

  // Get file type color
  const getFileTypeColor = useCallback(() => {
    if (!file.mime_type) return 'text-gray-500 bg-gray-100';

    const mimeType = file.mime_type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'text-green-600 bg-green-100';
    if (mimeType.includes('pdf')) return 'text-red-600 bg-red-100';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600 bg-blue-100';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-700 bg-green-100';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-600 bg-orange-100';
    if (mimeType.startsWith('video/')) return 'text-purple-600 bg-purple-100';
    if (mimeType.startsWith('audio/')) return 'text-pink-600 bg-pink-100';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'text-yellow-600 bg-yellow-100';
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return 'text-indigo-600 bg-indigo-100';

    return 'text-gray-500 bg-gray-100';
  }, [file.mime_type]);

  // Check if file can be previewed
  const canPreview = useCallback(() => {
    if (!file.mime_type) return false;
    const mimeType = file.mime_type.toLowerCase();
    return mimeType.startsWith('image/') || 
           mimeType.includes('pdf') || 
           mimeType.startsWith('text/') ||
           mimeType.includes('json');
  }, [file.mime_type]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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

  // Handle file click for preview
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't preview if clicking on action buttons
    if ((e.target as HTMLElement).closest('.file-actions')) {
      return;
    }

    if (canPreview()) {
      onPreview?.(file.id);
    }
  }, [file.id, onPreview, canPreview]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, file.id);
  }, [file.id, onContextMenu]);

  // Handle selection
  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect?.(file.id, isMultiSelect);
  }, [file.id, onSelect]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(file.id);
  }, [file.id, onToggleFavorite]);

  // Handle download
  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(file.id);
  }, [file.id, onDownload]);

  // Handle preview
  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(file.id);
  }, [file.id, onPreview]);

  // Grid view rendering
  if (viewMode === 'grid') {
    return (
      <div
        className={`file-grid group relative cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        } ${canPreview() ? 'cursor-pointer' : 'cursor-default'} ${className}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Grid Card */}
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
          
          {/* File Icon/Preview */}
          <div className="relative mb-3 h-12 w-12">
            {file.mime_type?.startsWith('image/') && !imageError ? (
              <img
                src={`/api/documents/${file.id}/thumbnail`} // You'll need to implement this endpoint
                alt={file.name}
                className="h-full w-full rounded object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center rounded ${getFileTypeColor()}`}>
                {getFileIcon()}
              </div>
            )}
            
            {/* File Type Badge */}
            <div className="absolute -bottom-1 -right-1 rounded bg-white px-1 py-0.5 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-700 dark:text-gray-300">
              {file.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
            </div>
          </div>

          {/* File Name */}
          <h3 
            className="mb-2 w-full truncate text-sm font-medium text-gray-900 dark:text-white" 
            title={file.name}
          >
            {file.name}
          </h3>

          {/* File Size */}
          <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(file.size_bytes)}
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div>{formatDate(file.created_at)}</div>
            {file.uploader_name && (
              <div className="mt-1">by {file.uploader_name}</div>
            )}
          </div>

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {file.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
              {file.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{file.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Action Buttons (Show on Hover) */}
          <div className={`file-actions absolute right-2 top-2 flex gap-1 transition-opacity ${
            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
          }`}>
            {canPreview() && (
              <button
                onClick={handlePreview}
                className="rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Preview file"
              >
                <EyeIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            <button
              onClick={handleDownload}
              className="rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="Download file"
            >
              <DownloadIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            </button>

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

          {/* Favorite Indicator */}
          {isFavorite && (
            <div className="absolute left-2 bottom-2">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view rendering
  return (
    <div
      className={`file-list group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${canPreview() ? 'cursor-pointer' : 'cursor-default'} ${className}`}
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

      {/* File Icon */}
      <div className="flex-shrink-0">
        <div className={`flex h-8 w-8 items-center justify-center rounded ${getFileTypeColor()}`}>
          {getFileIcon()}
        </div>
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-gray-900 dark:text-white">
            {file.name}
          </h3>
          {isFavorite && (
            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
          {file.is_shared && (
            <ShareIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
        
        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(file.size_bytes)}</span>
          <span>{formatDate(file.created_at)}</span>
          {file.uploader_name && (
            <span>by {file.uploader_name}</span>
          )}
          {file.tags && file.tags.length > 0 && (
            <span>{file.tags.length} tag{file.tags.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`file-actions flex gap-1 transition-opacity ${
        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
      }`}>
        {canPreview() && (
          <button
            onClick={handlePreview}
            className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Preview file"
          >
            <EyeIcon className="h-4 w-4 text-gray-500" />
          </button>
        )}
        
        <button
          onClick={handleDownload}
          className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Download file"
        >
          <DownloadIcon className="h-4 w-4 text-gray-500" />
        </button>

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