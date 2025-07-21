// components/documents/Folder/index.tsx - FIXED DOM STRUCTURE
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  chartColorClass?: string;
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
  chartColorClass,
  onNavigate,
  onToggleFavorite,
  onContextMenu,
  onSelect
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  const fileCount = folder.fileCount ?? 0;
  const paperLayers = Math.min(Math.max(fileCount, 1), 8);
  const isEmpty = fileCount === 0;
  const chartClass = chartColorClass || `chart-${(index % 5) + 1}`;

  // Theme variable detection
  useEffect(() => {
    const checkThemeVars = () => {
      if (typeof window !== "undefined") {
        const style = getComputedStyle(document.documentElement);
        const chartNumber = chartClass.replace('chart-', '');
        const chartVar = style.getPropertyValue(`--chart-${chartNumber}`).trim();
        const cardVar = style.getPropertyValue('--card').trim();
        
        if (chartVar && cardVar) {
          setThemeReady(true);
        } else {
          setTimeout(checkThemeVars, 50);
        }
      }
    };

    checkThemeVars();
  }, [chartClass]);

  // Event handlers
  const handleClick = (e: React.MouseEvent) => {
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
        className={`folder-list-item ${chartClass} ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        data-theme-ready={themeReady}
      >
        <div className="folder-list-content">
          <div className="folder-list-icon">
            <FolderIcon />
          </div>
          <div className="folder-list-info">
            <h3 className="folder-list-name">{folder.name}</h3>
            <p className="folder-list-count">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`folder-list-favorite ${isFavorite ? 'active' : ''}`}
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
        </div>
      </div>
    );
  }

  // FIXED 3D Grid view with correct DOM layering
  return (
    <div
      ref={folderRef}
      className={`folder-container-3d ${chartClass} ${
        isSelected ? 'selected' : ''
      } ${isEmpty ? 'empty' : ''} ${
        themeReady ? 'theme-ready' : 'theme-loading'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-file-count={fileCount}
      data-chart-class={chartClass}
    >
      {/* 3D Scene - DOM order controls visual layering */}
      <div className="folder-scene">
        
        {/* 1. BASE/BACK PANEL - Renders first (behind everything) */}
        <div className="folder-base" />
        
        {/* 2. FOLDER TAB - Renders second (behind cover but above base) */}
        <div className="folder-tab" />
        
        {/* 3. PAPER STACK - Renders third (multiple sheets, above tab) */}
        <div className="paper-stack">
          {Array.from({ length: paperLayers }, (_, layerIndex) => (
            <div
              key={`paper-${layerIndex}`}
              className="paper-sheet"
              data-layer={layerIndex}
            />
          ))}
        </div>

        {/* 4. FOLDER COVER - Renders fourth (front cover, above papers) */}
        <div className="folder-cover" />
      </div>

      {/* 5. CONTENT - Renders OUTSIDE scene, so it's always on top */}
      <div className="folder-content-overlay">
        {/* Folder title and count - NO background box */}
        <div className="folder-info">
          <h3 className="folder-title" title={folder.name}>
            {folder.name}
          </h3>
          <p className="folder-item-count">
            {isEmpty ? 'Empty' : `${fileCount} ${fileCount === 1 ? 'item' : 'items'}`}
          </p>
        </div>

        {/* Action buttons on hover */}
        <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
          <button
            onClick={handleFavoriteToggle}
            className={`action-button favorite-btn ${isFavorite ? 'active' : ''}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
          <button
            onClick={handleMoreClick}
            className="action-button menu-btn"
            title="More options"
          >
            <MoreVerticalIcon />
          </button>
        </div>
      </div>

      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <div>Chart: {chartClass}</div>
          <div>Files: {fileCount}</div>
          <div>Layers: {paperLayers}</div>
          <div>Theme: {themeReady ? '✅' : '⏳'}</div>
        </div>
      )}
    </div>
  );
}