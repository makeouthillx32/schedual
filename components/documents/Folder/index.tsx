// components/documents/Folder/index.tsx
'use client';

import React, { useState } from 'react';
import { FolderIcon, StarIcon, StarFilledIcon, MoreVerticalIcon } from './icons';
import './styles.scss';

interface FolderProps {
  folder: {
    id: string;
    name: string;
    path: string;
    type: 'folder';
    size_bytes?: number;
    created_at: string;
    updated_at: string;
    is_favorite: boolean;
    fileCount?: number; // Add this to track files in folder
  };
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  chartColorClass: string; // Add chart color class prop
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
  chartColorClass,
  onNavigate,
  onToggleFavorite,
  onContextMenu,
  onSelect
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get color classes based on chart color
  const getColorClasses = (chartColor: string) => {
    const colorMap: Record<string, { back: string; cover: string; tab: string }> = {
      'chart-1': {
        back: 'bg-gradient-to-br from-blue-500/90 via-blue-500/70 to-blue-500/50',
        cover: 'bg-gradient-to-br from-blue-400/90 via-blue-500/90 to-blue-500/70',
        tab: 'bg-gradient-to-br from-blue-400/90 to-blue-500'
      },
      'chart-2': {
        back: 'bg-gradient-to-br from-green-500/90 via-green-500/70 to-green-500/50',
        cover: 'bg-gradient-to-br from-green-400/90 via-green-500/90 to-green-500/70',
        tab: 'bg-gradient-to-br from-green-400/90 to-green-500'
      },
      'chart-3': {
        back: 'bg-gradient-to-br from-yellow-500/90 via-yellow-500/70 to-yellow-500/50',
        cover: 'bg-gradient-to-br from-yellow-400/90 via-yellow-500/90 to-yellow-500/70',
        tab: 'bg-gradient-to-br from-yellow-400/90 to-yellow-500'
      },
      'chart-4': {
        back: 'bg-gradient-to-br from-purple-500/90 via-purple-500/70 to-purple-500/50',
        cover: 'bg-gradient-to-br from-purple-400/90 via-purple-500/90 to-purple-500/70',
        tab: 'bg-gradient-to-br from-purple-400/90 to-purple-500'
      },
      'chart-5': {
        back: 'bg-gradient-to-br from-red-500/90 via-red-500/70 to-red-500/50',
        cover: 'bg-gradient-to-br from-red-400/90 via-red-500/90 to-red-500/70',
        tab: 'bg-gradient-to-br from-red-400/90 to-red-500'
      }
    };

    // Default colors for selected/empty states
    if (isSelected) {
      return {
        back: 'bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50',
        cover: 'bg-gradient-to-br from-primary/90 via-primary to-primary/70',
        tab: 'bg-gradient-to-br from-primary/90 to-primary'
      };
    }

    if (isEmpty) {
      return {
        back: 'bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40',
        cover: 'bg-gradient-to-br from-muted/90 via-muted/80 to-muted/60',
        tab: 'bg-gradient-to-br from-muted/90 to-muted/80'
      };
    }

    return colorMap[chartColor] || colorMap['chart-1'];
  };

  const colorClasses = getColorClasses(chartColorClass);

  // Calculate paper layers based on file count
  const fileCount = folder.fileCount || 0;
  const paperLayers = Math.min(Math.max(fileCount, 0), 5); // Max 5 papers, 0 if empty
  const isEmpty = fileCount === 0;

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect(folder.id, true);
    } else {
      onNavigate(folder.path);
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu(e, folder.id);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(folder.path, folder.name);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`folder-list-item ${isSelected ? 'selected' : ''} bg-card border-border hover:bg-accent`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="folder-icon-small bg-muted border-border">
            <FolderIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{folder.name}</h3>
            <p className="text-sm text-muted-foreground">{fileCount} items</p>
          </div>
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
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`folder-container ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* 3D Folder Structure */}
      <div className="folder-3d">
        {/* Back of folder */}
        <div className={`folder-back ${colorClasses.back}`}></div>
        
        {/* Dynamic Paper Layers */}
        {Array.from({ length: paperLayers }, (_, index) => (
          <div 
            key={index}
            className="folder-paper bg-card border-border"
            style={{
              transform: `translateZ(${(index + 1) * 2}px) translateY(-${index * 1}px)`,
              opacity: 0.9 - (index * 0.1),
              zIndex: index + 1
            }}
          />
        ))}
        
        {/* Folder Cover */}
        <div 
          className={`folder-cover ${colorClasses.cover}`}
          style={{
            transform: `translateZ(${paperLayers * 2 + 5}px)`,
            zIndex: paperLayers + 10
          }}
        >
          {/* Folder Tab */}
          <div className={`folder-tab ${colorClasses.tab}`}></div>
        </div>
        
        {/* Folder Content Overlay */}
        <div 
          className="folder-content"
          style={{
            transform: `translateZ(${paperLayers * 2 + 10}px)`,
            zIndex: paperLayers + 20
          }}
        >
          <div className="folder-info">
            <h3 className="folder-name text-foreground">{folder.name}</h3>
            <p className="folder-count text-muted-foreground">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn favorite bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isFavorite ? 'active !text-yellow-500 !bg-yellow-50 !border-yellow-200' : ''}`}
              title="Toggle favorite"
            >
              {isFavorite ? <StarFilledIcon /> : <StarIcon />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, folder.id);
              }}
              className="action-btn more bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              title="More options"
            >
              <MoreVerticalIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}