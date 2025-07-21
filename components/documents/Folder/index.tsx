// components/documents/Folder/index.tsx - FIXED VERSION
'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  StarIcon,
  StarFilledIcon,
  MoreVerticalIcon
} from './icons';
import './styles.scss';

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
  chartColorClass?: string;  // ✅ ADD THIS - FileGrid passes this
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
  chartColorClass,  // ✅ USE THIS instead of calculating
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

  // ✅ USE the chartColorClass passed from FileGrid, fallback to index calculation
  const chartClass = chartColorClass || `chart-${(index % 5) + 1}`;

  // Ensure theme variables are loaded
  useEffect(() => {
    const checkThemeVars = () => {
      if (typeof window !== "undefined") {
        const style = getComputedStyle(document.documentElement);
        // Extract chart number from chartClass (e.g., "chart-1" -> "1")
        const chartNumber = chartClass.replace('chart-', '');
        const chartVar = style.getPropertyValue(`--chart-${chartNumber}`).trim();
        const cardVar = style.getPropertyValue('--card').trim();
        
        if (chartVar && cardVar) {
          setThemeReady(true);
        } else {
          // Retry after a short delay if theme variables aren't ready
          setTimeout(checkThemeVars, 100);
        }
      }
    };

    checkThemeVars();
  }, [chartClass]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent action if clicking on buttons
    if ((e.target as HTMLElement).closest('.folder-actions')) return;
    
    if (e.ctrlKey || e.metaKey) {
      onSelect(folder.id, true);
    } else {
      onNavigate(folder.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
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

  // List view rendering
  if (viewMode === 'list') {
    return (
      <div
        className="folder-list-item"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        data-selected={isSelected}
      >
        <div className="flex items-center gap-3">
          <div className="folder-icon-small">
            <FolderIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {folder.name}
            </h3>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className="p-1 rounded transition-colors hover:bg-accent"
            style={{
              color: isFavorite 
                ? 'hsl(var(--warning))' 
                : 'hsl(var(--muted-foreground))'
            }}
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
        </div>
      </div>
    );
  }

  // Grid view rendering with 3D effect
  return (
    <div
      className={`folder-container ${chartClass} ${
        isSelected ? 'selected' : ''
      } ${isEmpty ? 'empty' : ''} ${themeReady ? 'theme-ready' : 'theme-loading'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-file-count={fileCount}
      data-chart-class={chartClass}
    >
      <div className="folder-3d">
        {/* Back panel */}
        <div className="folder-back" />

        {/* Paper layers representing file count */}
        {Array.from({ length: paperLayers }, (_, layerIndex) => (
          <div
            key={layerIndex}
            className="folder-paper"
            style={{
              transform: `translateZ(${(layerIndex + 1) * 2}px) translateY(-${layerIndex}px)`,
              opacity: Math.max(0.3, 0.9 - layerIndex * 0.15),
              zIndex: layerIndex + 1
            }}
          />
        ))}

        {/* Folder cover with tab */}
        <div
          className="folder-cover"
          style={{
            transform: `translateZ(${paperLayers * 2 + 5}px)`,
            zIndex: paperLayers + 10
          }}
        >
          <div className="folder-tab" />
        </div>

        {/* Content overlay */}
        <div
          className="folder-content"
          style={{
            transform: `translateZ(${paperLayers * 2 + 10}px)`,
            zIndex: paperLayers + 20
          }}
        >
          <div className="folder-info">
            <h3 className="folder-name" title={folder.name}>
              {folder.name}
            </h3>
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

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 text-xs bg-black text-white p-1 opacity-0 hover:opacity-100 transition-opacity z-50">
          <div>Chart: {chartClass}</div>
          <div>Files: {fileCount}</div>
          <div>Theme: {themeReady ? '✅' : '⏳'}</div>
          <div>Index: {index}</div>
        </div>
      )}
    </div>
  );
}