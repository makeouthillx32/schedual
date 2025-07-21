// components/documents/Folder/index.tsx - COMPLETELY REMADE
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
  const [isClicked, setIsClicked] = useState(false); // Track if folder was clicked once
  const [themeReady, setThemeReady] = useState(false);

  const fileCount = folder.fileCount ?? 0;
  const paperLayers = Math.min(Math.max(fileCount, 1), 5);
  const isEmpty = fileCount === 0;
  const chartClass = chartColorClass || `chart-${(index % 5) + 1}`;

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== "undefined") {
        const style = getComputedStyle(document.documentElement);
        const chartNumber = chartClass.replace('chart-', '');
        const chartVar = style.getPropertyValue(`--chart-${chartNumber}`).trim();
        if (chartVar) setThemeReady(true);
        else setTimeout(checkTheme, 50);
      }
    };
    checkTheme();
  }, [chartClass]);

  // Event handlers - FIXED DOUBLE CLICK BEHAVIOR
  const handleClick = (e: React.MouseEvent) => {
    // If clicking on action buttons, don't do anything
    if ((e.target as HTMLElement).closest('.folder-actions')) return;
    
    if (e.ctrlKey || e.metaKey) {
      onSelect(folder.id, true);
      return;
    }

    // First click: show buttons
    if (!isClicked) {
      setIsClicked(true);
      return;
    }

    // Second click: navigate to folder
    onNavigate(folder.path);
  };

  // Hide buttons when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsClicked(false); // Reset click state when mouse leaves
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

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={`folder-list-item ${chartClass} ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
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

  // Grid view with CORRECTED DOM structure
  return (
    <div
      className={`folder-3d ${chartClass} ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : ''} ${themeReady ? 'ready' : 'loading'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{
        position: 'relative',
        width: '200px',
        height: '150px',
        margin: '20px auto',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        transform: isSelected ? 'translateY(-8px) scale(1.05)' : 
                  isHovered ? 'translateY(-5px) scale(1.02)' : 'none'
      }}
    >
      {/* 1. BACK PANEL - Renders first (behind everything) */}
      <div 
        className="folder-back"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: '4px',
          left: '4px',
          borderRadius: '12px',
          background: `linear-gradient(145deg, hsl(var(--${chartClass}) / 0.8) 0%, hsl(var(--${chartClass}) / 0.5) 100%)`,
          boxShadow: `var(--shadow), inset 0 3px 6px rgba(0, 0, 0, 0.2)`,
          ...(isSelected && {
            background: 'linear-gradient(145deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.5) 100%)',
            boxShadow: `var(--shadow), inset 0 3px 6px rgba(0, 0, 0, 0.25)`
          }),
          ...(isEmpty && {
            background: 'linear-gradient(145deg, hsl(var(--muted) / 0.8) 0%, hsl(var(--muted) / 0.5) 100%)',
            boxShadow: `var(--shadow), inset 0 3px 6px rgba(0, 0, 0, 0.15)`
          })
        }}
      ></div>
      
      {/* 2. FRONT COVER WITH TAB - Renders second */}
      <div 
        className="folder-front"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: '0px',
          left: '0px',
          borderRadius: '12px 6px 12px 12px',
          background: `linear-gradient(145deg, hsl(var(--${chartClass})) 0%, hsl(var(--${chartClass}) / 0.9) 100%)`,
          border: `2px solid hsl(var(--${chartClass}) / 0.7)`,
          boxShadow: `var(--shadow), inset 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.1)`,
          ...(isSelected && {
            background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.9) 100%)',
            borderColor: 'hsl(var(--primary) / 0.7)',
            boxShadow: `var(--shadow), inset 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.15)`
          }),
          ...(isEmpty && {
            background: 'linear-gradient(145deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.7) 100%)',
            borderColor: 'hsl(var(--muted) / 0.6)',
            boxShadow: `var(--shadow), inset 0 2px 6px rgba(0, 0, 0, 0.1), inset 0 -2px 3px rgba(0, 0, 0, 0.05)`
          })
        }}
      >
        {/* TAB - Part of front cover, not separate element */}
        <div 
          className="folder-tab"
          style={{
            position: 'absolute',
            width: '60px',
            height: '20px',
            top: '-10px',
            left: '20px',
            borderRadius: '8px 8px 0 0',
            background: `hsl(var(--${chartClass}) / 0.95)`,
            border: `2px solid hsl(var(--${chartClass}) / 0.7)`,
            borderBottom: 'none',
            boxShadow: `var(--shadow), inset 0 1px 3px rgba(0, 0, 0, 0.1)`,
            ...(isSelected && {
              background: 'hsl(var(--primary) / 0.95)',
              borderColor: 'hsl(var(--primary) / 0.7)',
              boxShadow: `var(--shadow), inset 0 1px 3px rgba(0, 0, 0, 0.15)`
            }),
            ...(isEmpty && {
              background: 'hsl(var(--muted) / 0.8)',
              borderColor: 'hsl(var(--muted) / 0.6)',
              boxShadow: `var(--shadow), inset 0 1px 3px rgba(0, 0, 0, 0.05)`
            })
          }}
        ></div>
      </div>
      
      {/* 3. PAPER SHEETS - Render third (ON TOP, visible) */}
      {Array.from({ length: paperLayers }, (_, i) => (
        <div 
          key={i} 
          className="paper" 
          style={{
            position: 'absolute',
            width: '85%',
            height: '70%',
            left: '7.5%',
            top: `${20 - i * 2}%`, // Spread papers out visibly
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border) / 0.3)',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transform: `translateY(-${i * 3}px) translateX(${i * 2}px)`, // Visible stacking
            opacity: isEmpty ? 0.3 : (1 - i * 0.1),
            zIndex: 10 + i
          }}
        ></div>
      ))}
      
      {/* 4. TEXT CONTENT - Renders fourth (on top of papers) */}
      <div 
        className="folder-text"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 50,
          pointerEvents: 'none'
        }}
      >
        <h3 
          className="folder-name"
          style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '120px'
          }}
        >
          {folder.name}
        </h3>
        <p 
          className="folder-count"
          style={{
            margin: '0',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
            fontWeight: '500'
          }}
        >
          {isEmpty ? 'Empty' : `${fileCount} ${fileCount === 1 ? 'item' : 'items'}`}
        </p>
      </div>
      
      {/* 5. ACTION BUTTONS - Render last (topmost), show on click or hover */}
      <div 
        className={`folder-actions ${(isHovered || isClicked) ? 'show' : ''}`}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px',
          opacity: (isHovered || isClicked) ? 1 : 0,
          transform: (isHovered || isClicked) ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)',
          transition: 'all 0.3s ease',
          zIndex: 100,
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={handleFavoriteToggle}
          className={`action-btn favorite ${isFavorite ? 'active' : ''}`}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            background: isFavorite ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: isFavorite ? '#ffc107' : 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = isFavorite ? 'rgba(255, 193, 7, 0.4)' : 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = isFavorite ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.2)';
          }}
        >
          {isFavorite ? <StarFilledIcon /> : <StarIcon />}
        </button>
        <button 
          onClick={handleMoreClick} 
          className="action-btn more"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <MoreVerticalIcon />
        </button>
      </div>
    </div>
  );
}