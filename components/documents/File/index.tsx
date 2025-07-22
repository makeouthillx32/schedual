// components/documents/File/index.tsx
'use client';

import React, { useState } from 'react';
import { FileIcon, StarIcon, StarFilledIcon, MoreVerticalIcon, DownloadIcon } from '../icons';

interface FileProps {
  file: {
    id: string;
    name: string;
    path: string;
    type: 'file';
    size_bytes?: number;
    created_at: string;
    updated_at: string;
    is_favorite: boolean;
    mime_type?: string;
    uploader_name?: string;
    tags?: string[];
  };
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string, isMulti: boolean) => void;
}

export default function File({
  file,
  viewMode,
  isSelected,
  isFavorite,
  onPreview,
  onDownload,
  onToggleFavorite,
  onContextMenu,
  onSelect
}: FileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Clean up filename - remove MIME type if it appears as filename
  const getDisplayName = (): string => {
    // Check if the filename is actually a MIME type
    const mimeTypePattern = /^(application\/|text\/|image\/|video\/|audio\/|vnd\.|multipart\/)/i;
    
    if (mimeTypePattern.test(file.name)) {
      // If filename is a MIME type, try to extract actual filename from other sources
      // or generate a user-friendly name
      return getFileNameFromMimeType(file.mime_type || file.name);
    }
    
    return file.name;
  };

  // Generate user-friendly filename from MIME type
  const getFileNameFromMimeType = (mimeType: string): string => {
    const mime = mimeType.toLowerCase();
    const timestamp = new Date(file.created_at).toLocaleDateString();
    
    if (mime.includes('spreadsheet') || mime.includes('excel')) {
      return `Spreadsheet_${timestamp}.xlsx`;
    }
    if (mime.includes('document') || mime.includes('word')) {
      return `Document_${timestamp}.docx`;
    }
    if (mime.includes('presentation') || mime.includes('powerpoint')) {
      return `Presentation_${timestamp}.pptx`;
    }
    if (mime.includes('pdf')) {
      return `Document_${timestamp}.pdf`;
    }
    if (mime.startsWith('image/')) {
      const ext = mime.split('/')[1] || 'jpg';
      return `Image_${timestamp}.${ext}`;
    }
    if (mime.startsWith('video/')) {
      const ext = mime.split('/')[1] || 'mp4';
      return `Video_${timestamp}.${ext}`;
    }
    if (mime.startsWith('audio/')) {
      const ext = mime.split('/')[1] || 'mp3';
      return `Audio_${timestamp}.${ext}`;
    }
    
    return `File_${timestamp}`;
  };

  // Get file type for display in metadata
  const getFileTypeDisplay = (): string => {
    if (!file.mime_type) return 'Unknown';
    
    const mime = file.mime_type.toLowerCase();
    
    if (mime.includes('spreadsheet') || mime.includes('excel')) return 'Excel Spreadsheet';
    if (mime.includes('document') || mime.includes('word')) return 'Word Document';
    if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PowerPoint Presentation';
    if (mime.includes('pdf')) return 'PDF Document';
    if (mime.startsWith('image/')) return 'Image';
    if (mime.startsWith('video/')) return 'Video';
    if (mime.startsWith('audio/')) return 'Audio';
    if (mime.startsWith('text/')) return 'Text File';
    
    return 'File';
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
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

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect(file.id, true);
    } else {
      onPreview();
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu(e, file.id);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  // Handle download
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload();
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent cursor-pointer transition-colors ${
          isSelected ? 'bg-primary/10 border-primary' : ''
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex-shrink-0">
          <FileIcon mimeType={file.mime_type} fileName={getDisplayName()} size="md" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{getDisplayName()}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatFileSize(file.size_bytes)}</span>
            <span>{formatDate(file.created_at)}</span>
            <span>{getFileTypeDisplay()}</span>
            {file.uploader_name && <span>by {file.uploader_name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-1 rounded transition-colors ${
              isFavorite 
                ? 'text-yellow-500' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle favorite"
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Download"
          >
            <DownloadIcon />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, file.id);
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="More options"
          >
            <MoreVerticalIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`file-item relative rounded-lg bg-card border border-border p-4 transition-all hover:shadow-md cursor-pointer ${
        isSelected ? 'bg-primary/10 border-primary' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* File Icon/Thumbnail */}
      <div className="mb-3 flex justify-center">
        <div className="relative">
          {file.mime_type?.startsWith('image/') && !imageError ? (
            <img
              src={file.path}
              alt={getDisplayName()}
              className="h-16 w-16 rounded object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <FileIcon mimeType={file.mime_type} fileName={getDisplayName()} size="xl" />
          )}
        </div>
      </div>

      {/* File Name */}
      <h3 
        className="mb-2 text-center text-sm font-medium text-foreground line-clamp-2" 
        title={getDisplayName()}
      >
        {getDisplayName()}
      </h3>

      {/* File Metadata */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Size:</span>
          <span>{formatFileSize(file.size_bytes)}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span>{getFileTypeDisplay()}</span>
        </div>
        <div className="flex justify-between">
          <span>Modified:</span>
          <span>{formatDate(file.updated_at)}</span>
        </div>
        {file.uploader_name && (
          <div className="flex justify-between">
            <span>By:</span>
            <span className="truncate">{file.uploader_name}</span>
          </div>
        )}
        {file.mime_type && (
          <div className="mt-2 p-1 bg-muted rounded text-xs font-mono text-center" title="MIME Type">
            {file.mime_type}
          </div>
        )}
      </div>

      {/* Tags */}
      {file.tags && file.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 justify-center">
          {file.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
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
      <div className={`absolute right-2 top-2 flex gap-1 transition-opacity ${
        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={handleFavoriteToggle}
          className={`p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
            isFavorite ? '!text-yellow-500 !bg-yellow-50 !border-yellow-200' : ''
          }`}
          title="Toggle favorite"
        >
          {isFavorite ? <StarFilledIcon /> : <StarIcon />}
        </button>
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Download"
        >
          <DownloadIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, file.id);
          }}
          className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="More options"
        >
          <MoreVerticalIcon />
        </button>
      </div>
    </div>
  );
}