// components/documents/Folder/index.tsx - COMPLETELY REBUILT
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
  const [isInteracting, setIsInteracting] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const folderRef = useRef<HTMLDivElement>(null);

  const fileCount = folder.fileCount ?? 0;
  const paperLayers = Math.min(Math.max(fileCount, 1), 8); // More realistic paper layers
  const isEmpty = fileCount === 0;
  const chartClass = chartColorClass || `chart-${(index % 5) + 1}`;

  // Advanced mouse tracking for 3D effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!folderRef.current) return;
    
    const rect = folderRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x: mouseX, y: mouseY });
  };

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
    
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 300);
    
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

  // Calculate 3D transforms
  const getTransformStyle = (layer: number = 0) => {
    if (!isHovered) return '';
    
    const baseRotateX = mousePosition.y * -8;
    const baseRotateY = mousePosition.x * 8;
    const translateZ = isInteracting ? -5 : layer * 1.5;
    
    return `perspective(1000px) rotateX(${baseRotateX}deg) rotateY(${baseRotateY}deg) translateZ(${translateZ}px)`;
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

  // Advanced 3D Grid view
  return (
    <div
      ref={folderRef}
      className={`folder-container-3d ${chartClass} ${
        isSelected ? 'selected' : ''
      } ${isEmpty ? 'empty' : ''} ${
        themeReady ? 'theme-ready' : 'theme-loading'
      } ${isInteracting ? 'interacting' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-file-count={fileCount}
      data-chart-class={chartClass}
      style={{ transform: getTransformStyle() }}
    >
      {/* 3D Scene Container */}
      <div className="folder-scene">
        
        {/* Base/Back Panel */}
        <div 
          className="folder-base"
          style={{ transform: 'translateZ(-15px) rotateX(-1deg)' }}
        />
        
        {/* Paper Stack - Multiple layers for depth */}
        <div className="paper-stack">
          {Array.from({ length: paperLayers }, (_, layerIndex) => (
            <div
              key={`paper-${layerIndex}`}
              className="paper-sheet"
              style={{
                transform: `translateZ(${-12 + layerIndex * 1.5}px) translateY(${-layerIndex * 0.5}px) rotateX(${layerIndex * 0.5}deg)`,
                opacity: Math.max(0.4, 1 - layerIndex * 0.08),
              }}
              data-layer={layerIndex}
            />
          ))}
        </div>

        {/* Folder Tab - BEHIND the cover */}
        <div 
          className="folder-tab"
          style={{ 
            transform: `translateZ(${paperLayers * 1.5 - 2}px) translateY(-2px)` 
          }}
        />

        {/* Folder Cover - ABOVE everything except content */}
        <div 
          className="folder-cover"
          style={{ 
            transform: `translateZ(${paperLayers * 1.5}px)` 
          }}
        />

        {/* Content Overlay - TOPMOST layer */}
        <div 
          className="folder-content-3d"
          style={{ 
            transform: `translateZ(${paperLayers * 1.5 + 8}px)` 
          }}
        >
          {/* Info Panel */}
          <div className="folder-info-panel">
            <h3 className="folder-title" title={folder.name}>
              {folder.name}
            </h3>
            <p className="folder-item-count">
              {isEmpty ? 'Empty' : `${fileCount} ${fileCount === 1 ? 'item' : 'items'}`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`folder-action-panel ${isHovered ? 'visible' : ''}`}>
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

        {/* Lighting Effects */}
        <div className="folder-lighting">
          <div className="ambient-light" />
          <div className="directional-light" />
        </div>
      </div>

      {/* Development Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <div>Chart: {chartClass}</div>
          <div>Files: {fileCount}</div>
          <div>Layers: {paperLayers}</div>
          <div>Theme: {themeReady ? '✅' : '⏳'}</div>
          <div>Mouse: {Math.round(mousePosition.x * 100)}, {Math.round(mousePosition.y * 100)}</div>
        </div>
      )}
    </div>
  );
}