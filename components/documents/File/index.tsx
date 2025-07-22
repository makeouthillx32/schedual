// components/documents/File/index.tsx
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
    if (!file.mime_type) return 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';

    const mimeType = file.mime_type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (mimeType.includes('pdf')) return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
    if (mimeType.startsWith('video/')) return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    if (mimeType.startsWith('audio/')) return 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30';

    return 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
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

  // Format MIME type for display
  const formatMimeType = (mimeType: string): string => {
    // Convert long MIME types to user-friendly names
    const mimeMap: Record<string, string> = {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
      'application/vnd.ms-excel': 'Excel',
      'application/msword': 'Word',
      'application/vnd.ms-powerpoint': 'PowerPoint',
      'application/pdf': 'PDF',
      'text/plain': 'Text',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'image/webp': 'WebP',
      'video/mp4': 'MP4',
      'audio/mpeg': 'MP3'
    };

    const friendlyName = mimeMap[mimeType.toLowerCase()];
    if (friendlyName) return friendlyName;

    // If not in our map, try to extract the subtype
    const parts = mimeType.split('/');
    if (parts.length === 2) {
      return parts[1].toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    return 'FILE';
  };

  // Handle file click for preview
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't preview if clicking on action buttons
    if ((e.target as HTMLElement).closest('.file-actions')) {
      return;
    }

    if (canPreview()) {
      onPreview?.(file.id);
    } else if (e.ctrlKey || e.metaKey) {
      onSelect?.(file.id, true);
    } else {
      onSelect?.(file.id, false);
    }
  }, [canPreview, onPreview, onSelect, file.id]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, file.id);
  }, [onContextMenu, file.id]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(file.id);
  }, [onToggleFavorite, file.id]);

  // Handle download
  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(file.id);
  }, [onDownload, file.id]);

  // Handle preview
  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(file.id);
  }, [onPreview, file.id]);

  if (viewMode === 'list') {
    return (
      <div
        className={`group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent hover:shadow-sm ${
          isSelected ? 'bg-accent border-primary' : 'bg-card border-border'
        } ${className}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* File Icon */}
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${getFileTypeColor()}`}>
          {getFileIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{file.name}</h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span>{formatFileSize(file.size_bytes)}</span>
            <span>{formatDate(file.created_at)}</span>
            {file.mime_type && <span>{formatMimeType(file.mime_type)}</span>}
            {file.uploader_name && <span>by {file.uploader_name}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canPreview() && (
            <button
              onClick={handlePreview}
              className="p-1.5 rounded hover:bg-accent-foreground/10 text-muted-foreground hover:text-foreground"
              title="Preview"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-accent-foreground/10 text-muted-foreground hover:text-foreground"
            title="Download"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>

          <button
            onClick={handleFavoriteToggle}
            className={`p-1.5 rounded hover:bg-accent-foreground/10 ${
              isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle favorite"
          >
            <StarIcon className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex h-48 w-full flex-col items-center rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-sm ${
        isSelected ? 'bg-accent border-primary' : 'bg-card border-border'
      } ${className}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* File Preview/Icon */}
      <div className="relative mb-3 h-16 w-16 flex-shrink-0">
        {file.mime_type?.startsWith('image/') && !imageError ? (
          <img
            src={`/api/documents/${file.id}/thumbnail`}
            alt={file.name}
            className="h-full w-full rounded object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center rounded ${getFileTypeColor()}`}>
            {getFileIcon()}
          </div>
        )}
      </div>

      {/* File Name */}
      <h3 
        className="mb-2 w-full truncate text-sm font-medium text-foreground text-center" 
        title={file.name}
      >
        {file.name}
      </h3>

      {/* Metadata Section - Now includes MIME type */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>{formatFileSize(file.size_bytes)}</div>
        <div>{formatDate(file.created_at)}</div>
        {file.mime_type && (
          <div className="font-medium">{formatMimeType(file.mime_type)}</div>
        )}
        {file.uploader_name && (
          <div>by {file.uploader_name}</div>
        )}
      </div>

      {/* Tags */}
      {file.tags && file.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {file.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {file.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{file.tags.length - 2}</span>
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
            className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background text-muted-foreground hover:text-foreground"
            title="Preview"
          >
            <EyeIcon className="h-3.5 w-3.5" />
          </button>
        )}
        
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background text-muted-foreground hover:text-foreground"
          title="Download"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleFavoriteToggle}
          className={`p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background ${
            isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle favorite"
        >
          <StarIcon className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu?.(e, file.id);
          }}
          className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background text-muted-foreground hover:text-foreground"
          title="More options"
        >
          <MoreVerticalIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}