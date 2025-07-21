// components/documents/Folder/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  StarIcon,
  StarFilledIcon,
  MoreVerticalIcon
} from './icons';
import './styles.css';

interface FolderProps {
  folder: {
    id: string;
    name: string;
    path: string;
    type: 'folder';
    is_favorite: boolean;
    fileCount?: number;
  };
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  index?: number;
  onNavigate: (path: string) => void;
  onToggleFavorite: (path: string, name: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string, isMulti: boolean) => void;
}

export default function Folder({
  folder,
  viewMode,
  isSelected,
  isFavorite,
  index = 0,
  onNavigate,
  onToggleFavorite,
  onContextMenu,
  onSelect
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  const fileCount = folder.fileCount ?? 0;
  const paperLayers = Math.min(Math.max(fileCount, 0), 5);
  const isEmpty = fileCount === 0;

  // Ensure theme variables are available
  useEffect(() => {
    const checkThemeVars = () => {
      if (typeof window !== "undefined") {
        const style = getComputedStyle(document.documentElement);
        const hasChart1 = style.getPropertyValue('--chart-1').trim();
        const hasCard = style.getPropertyValue('--card').trim();
        
        if (hasChart1 && hasCard) {
          setThemeReady(true);
        } else {
          // Retry after a short delay if theme vars aren't ready
          setTimeout(checkThemeVars, 100);
        }
      }
    };

    checkThemeVars();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent action if clicking on action buttons
    if ((e.target as HTMLElement).closest('.folder-actions')) {
      return;
    }
    
    if (e.ctrlKey || e.metaKey) {
      onSelect(folder.id, true);
    } else {
      onNavigate(folder.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu(e, folder.id);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(folder.path, folder.name);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, folder.id);
  };

  // Generate chart class - cycle through chart-1 to chart-5
  const chartClass = `chart-${(index % 5) + 1}`;

  // List view rendering
  if (viewMode === 'list') {
    return (
      <div
        className="folder-list-item"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          backgroundColor: isSelected ? 'hsl(var(--accent))' : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="folder-icon-small">
            <FolderIcon />
          </div>
          <div className="flex-1">
            <h3 
              className="font-medium"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {folder.name}
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className="p-1 rounded transition-colors"
            style={{
              color: isFavorite 
                ? 'hsl(var(--warning))' 
                : 'hsl(var(--muted-foreground))'
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
        </div>
      </div>
    );
  }

  // Grid/3D view rendering
  return (
    <div
      className={`folder-container ${chartClass} ${
        isSelected ? 'selected' : ''
      } ${isEmpty ? 'empty' : ''} ${!themeReady ? 'theme-loading' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={`${folder.name} (${fileCount} ${fileCount === 1 ? 'item' : 'items'})`}
    >
      <div className="folder-3d">
        {/* Back panel */}
        <div className="folder-back"></div>

        {/* Paper Layers - Only render if we have files and theme is ready */}
        {themeReady && !isEmpty && Array.from({ length: paperLayers }, (_, layerIndex) => (
          <div
            key={`paper-${layerIndex}`}
            className="folder-paper"
            style={{
              transform: `translateZ(${(layerIndex + 1) * 2}px) translateY(-${layerIndex}px)`,
              opacity: Math.max(0.3, 0.9 - layerIndex * 0.15),
              zIndex: layerIndex + 1,
              width: `${95 - layerIndex * 2}%`,
              height: `${90 - layerIndex * 2}%`,
              left: `${2.5 + layerIndex}%`,
              top: `${8 + layerIndex * 2}%`,
            }}
          />
        ))}

        {/* Folder Cover & Tab */}
        <div
          className="folder-cover"
          style={{
            transform: `translateZ(${paperLayers * 2 + 5}px)`,
            zIndex: paperLayers + 10
          }}
        >
          <div className="folder-tab"></div>
        </div>

        {/* Overlay Content */}
        <div
          className="folder-content"
          style={{
            transform: `translateZ(${paperLayers * 2 + 10}px)`,
            zIndex: paperLayers + 20
          }}
        >
          <div className="folder-info">
            <h3 className="folder-name">{folder.name}</h3>
            <p className="folder-count">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn favorite ${isFavorite ? 'active' : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <StarFilledIcon /> : <StarIcon />}
            </button>
            <button
              onClick={handleMoreClick}
              className="action-btn more"
              title="More options"
              aria-label="More options"
            >
              <MoreVerticalIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Theme loading indicator - only in development */}
      {process.env.NODE_ENV === 'development' && !themeReady && (
        <div className="absolute top-0 left-0 w-full h-full bg-muted/50 flex items-center justify-center text-xs">
          Loading theme...
        </div>
      )}
    </div>
  );
}