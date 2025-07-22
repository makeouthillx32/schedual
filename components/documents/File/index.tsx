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

  const getFileTypeColor = useCallback(() => {
    if (!file.mime_type) return 'text-muted-foreground bg-muted';

    const mimeType = file.mime_type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'text-primary bg-primary/10';
    if (mimeType.includes('pdf')) return 'text-destructive bg-destructive/10';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-accent-foreground bg-accent';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-primary bg-primary/20';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-secondary-foreground bg-secondary';
    if (mimeType.startsWith('video/')) return 'text-primary bg-primary/15';
    if (mimeType.startsWith('audio/')) return 'text-accent-foreground bg-accent/80';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'text-secondary-foreground bg-secondary/80';
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return 'text-primary bg-primary/25';

    return 'text-muted-foreground bg-muted';
  }, [file.mime_type]);

  const canPreview = useCallback(() => {
    if (!file.mime_type) return false;
    const mimeType = file.mime_type.toLowerCase();
    return mimeType.startsWith('image/') || 
           mimeType.includes('pdf') || 
           mimeType.startsWith('text/') ||
           mimeType.includes('json');
  }, [file.mime_type]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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

  const handleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.file-actions')) {
      return;
    }

    if (canPreview()) {
      onPreview?.(file.id);
    }
  }, [file.id, onPreview, canPreview]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, file.id);
  }, [file.id, onContextMenu]);

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect?.(file.id, isMultiSelect);
  }, [file.id, onSelect]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(file.id);
  }, [file.id, onToggleFavorite]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(file.id);
  }, [file.id, onDownload]);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(file.id);
  }, [file.id, onPreview]);

  if (viewMode === 'grid') {
    return (
      <div
        className={`file-grid group relative cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-ring ring-offset-2' : ''
        } ${canPreview() ? 'cursor-pointer' : 'cursor-default'} ${className}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col space-y-2">
          
          <div className="relative h-32 w-full">
            {file.mime_type?.startsWith('image/') && !imageError ? (
              <img
                src={`/api/documents/${file.id}/thumbnail`}
                alt={file.name}
                className="h-full w-full rounded-lg object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center rounded-lg ${getFileTypeColor()}`}>
                <div className="h-16 w-16">
                  {getFileIcon()}
                </div>
              </div>
            )}
            
            <div className="absolute top-2 right-2 rounded bg-background/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              {file.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
            </div>

            <div className={`file-actions absolute right-2 top-2 flex gap-1 transition-opacity ${
              isHovered || isSelected ? 'opacity-100' : 'opacity-0'
            }`}>
              {canPreview() && (
                <button
                  onClick={handlePreview}
                  className="rounded-full bg-background p-1 shadow-md transition-colors hover:bg-muted"
                  title="Preview file"
                >
                  <EyeIcon className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
              
              <button
                onClick={handleDownload}
                className="rounded-full bg-background p-1 shadow-md transition-colors hover:bg-muted"
                title="Download file"
              >
                <DownloadIcon className="h-3 w-3 text-muted-foreground" />
              </button>

              <button
                onClick={handleToggleFavorite}
                className="rounded-full bg-background p-1 shadow-md transition-colors hover:bg-muted"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <StarIcon 
                  className={`h-3 w-3 ${
                    isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
                  }`}
                />
              </button>
              
              <button
                onClick={handleContextMenu}
                className="rounded-full bg-background p-1 shadow-md transition-colors hover:bg-muted"
                title="More options"
              >
                <MoreVerticalIcon className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {(isHovered || isSelected) && (
              <div className="absolute left-2 top-2">
                <button
                  onClick={handleSelect}
                  className="rounded border-2 border-border bg-background p-0.5 transition-colors hover:border-ring"
                >
                  <div className={`h-3 w-3 rounded ${
                    isSelected ? 'bg-primary' : 'bg-transparent'
                  }`} />
                </button>
              </div>
            )}

            {isFavorite && (
              <div className="absolute left-2 bottom-2">
                <StarIcon className="h-4 w-4 fill-primary text-primary" />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-border/60 hover:shadow-md">
            <h3 
              className="text-sm font-medium text-card-foreground line-clamp-2 mb-2" 
              title={file.name}
            >
              {file.name}
            </h3>

            <div className="text-xs text-muted-foreground mb-1">
              {formatFileSize(file.size_bytes)}
            </div>

            <div className="text-xs text-muted-foreground">
              <div>{formatDate(file.created_at)}</div>
              {file.uploader_name && (
                <div className="mt-1">by {file.uploader_name}</div>
              )}
            </div>

            {file.tags && file.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`file-list group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:bg-muted/50 ${
        isSelected ? 'ring-2 ring-ring ring-offset-2' : ''
      } ${canPreview() ? 'cursor-pointer' : 'cursor-default'} ${className}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isHovered || isSelected) && (
        <button
          onClick={handleSelect}
          className="rounded border-2 border-border bg-background p-0.5 transition-colors hover:border-ring"
        >
          <div className={`h-3 w-3 rounded ${
            isSelected ? 'bg-primary' : 'bg-transparent'
          }`} />
        </button>
      )}

      <div className="flex-shrink-0">
        <div className={`flex h-8 w-8 items-center justify-center rounded ${getFileTypeColor()}`}>
          {getFileIcon()}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-card-foreground">
            {file.name}
          </h3>
          {isFavorite && (
            <StarIcon className="h-4 w-4 fill-primary text-primary" />
          )}
          {file.is_shared && (
            <ShareIcon className="h-4 w-4 text-primary" />
          )}
        </div>
        
        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
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

      <div className={`file-actions flex gap-1 transition-opacity ${
        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
      }`}>
        {canPreview() && (
          <button
            onClick={handlePreview}
            className="rounded p-1 transition-colors hover:bg-muted"
            title="Preview file"
          >
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        
        <button
          onClick={handleDownload}
          className="rounded p-1 transition-colors hover:bg-muted"
          title="Download file"
        >
          <DownloadIcon className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={handleToggleFavorite}
          className="rounded p-1 transition-colors hover:bg-muted"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <StarIcon 
            className={`h-4 w-4 ${
              isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        </button>
        
        <button
          onClick={handleContextMenu}
          className="rounded p-1 transition-colors hover:bg-muted"
          title="More options"
        >
          <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}