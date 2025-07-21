// components/documents/Folder/index.tsx - PRECISE POSITIONING MAP
'use client';

import React, { useState } from 'react';
import {
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
  onNavigate: (path: string) => void;
  onToggleFavorite: (path: string, name: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string, isMulti: boolean) => void;
}

// PRECISE COORDINATE MAPPING
const FOLDER_DIMENSIONS = {
  // Container dimensions (200px x 160px from SCSS)
  container: {
    width: 200,
    height: 160,
    top: 0,
    left: 0,
    bottom: 160, // top + height
    right: 200   // left + width
  }
};

// Calculate exact positions for each layer
const LAYER_POSITIONS = {
  // 1. FOLDER BACK - translateZ(-30px), z-index: 0
  back: {
    width: 200,        // 100% of container
    height: 160,       // 100% of container  
    top: 6,           // Offset behind cover
    left: 6,          // Offset behind cover
    bottom: 166,      // top + height
    right: 206,       // left + width
    zIndex: 0
  },
  
  // 2. PAPER LAYERS - Each layer precisely positioned
  papers: [
    // Paper Layer 1 - Green, peeks out at top
    {
      width: 188,       // 94% of 200px
      height: 140.8,    // 88% of 160px
      top: -3.2,        // -2% of 160px (PEEK OUT)
      left: 6,          // 3% of 200px
      bottom: 137.6,    // top + height
      right: 194,       // left + width
      zIndex: 1
    },
    // Paper Layer 2 - Blue
    {
      width: 184,       // 92% of 200px
      height: 137.6,    // 86% of 160px
      top: 0,           // 0% of 160px
      left: 8,          // 4% of 200px
      bottom: 137.6,    // top + height
      right: 192,       // left + width
      zIndex: 2
    },
    // Paper Layer 3 - Yellow
    {
      width: 180,       // 90% of 200px
      height: 134.4,    // 84% of 160px
      top: 3.2,         // 2% of 160px
      left: 10,         // 5% of 200px
      bottom: 137.6,    // top + height
      right: 190,       // left + width
      zIndex: 3
    },
    // Paper Layer 4 - Purple
    {
      width: 176,       // 88% of 200px
      height: 131.2,    // 82% of 160px
      top: 6.4,         // 4% of 160px
      left: 12,         // 6% of 200px
      bottom: 137.6,    // top + height
      right: 188,       // left + width
      zIndex: 4
    },
    // Paper Layer 5 - Orange
    {
      width: 172,       // 86% of 200px
      height: 128,      // 80% of 160px
      top: 9.6,         // 6% of 160px
      left: 14,         // 7% of 200px
      bottom: 137.6,    // top + height
      right: 186,       // left + width
      zIndex: 5
    }
  ],
  
  // 3. FOLDER TAB - Behind cover, precise position
  tab: {
    width: 60,         // Fixed width from SCSS
    height: 20,        // Fixed height from SCSS
    top: -8,           // Above folder edge
    left: 20,          // Fixed left position
    bottom: 12,        // top + height
    right: 80,         // left + width
    zIndex: 8
  },
  
  // 4. FOLDER COVER - Main folder surface
  cover: {
    width: 200,        // 100% of container
    height: 160,       // 100% of container
    top: 0,            // Aligned with container
    left: 0,           // Aligned with container
    bottom: 160,       // top + height
    right: 200,        // left + width
    zIndex: 10
  },
  
  // 5. FOLDER CONTENT - Always on top
  content: {
    width: 200,        // 100% of container
    height: 160,       // 100% of container
    top: 0,            // Full overlay
    left: 0,           // Full overlay
    bottom: 160,       // top + height
    right: 200,        // left + width
    zIndex: 100
  }
};

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

  const fileCount = folder.fileCount ?? 3;
  const isEmpty = fileCount === 0;

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.folder-actions')) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      onSelect(folder.id, true);
    } else {
      onNavigate(folder.path);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(folder.path, folder.name);
  };

  const handleContextMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, folder.id);
  };

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))',
        }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, folder.id)}
      >
        <div 
          className="w-6 h-6 rounded"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        />
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
          className="p-1 rounded transition-colors"
          style={{ 
            color: isFavorite ? 'hsl(var(--chart-3))' : 'hsl(var(--muted-foreground))' 
          }}
        >
          {isFavorite ? <StarFilledIcon /> : <StarIcon />}
        </button>
      </div>
    );
  }

  // 3D Grid view - PRECISE POSITIONING using coordinate map
  return (
    <div
      className={`folder-container ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, folder.id)}
    >
      <div className="folder-3d">
        
        {/* 1. FOLDER BACK - Exact coordinates from map */}
        <div 
          className="folder-back"
          style={{
            backgroundColor: 'hsl(var(--destructive))',
            borderColor: 'hsl(var(--destructive) / 0.8)',
            position: 'absolute',
            width: `${LAYER_POSITIONS.back.width}px`,
            height: `${LAYER_POSITIONS.back.height}px`,
            top: `${LAYER_POSITIONS.back.top}px`,
            left: `${LAYER_POSITIONS.back.left}px`,
            zIndex: LAYER_POSITIONS.back.zIndex,
          }}
        />

        {/* 2. PAPER LAYERS - Exact coordinates for each layer */}
        {Array.from({ length: Math.min(fileCount, 5) }, (_, i) => {
          const chartVar = `--chart-${i + 1}`;
          const paperPos = LAYER_POSITIONS.papers[i];
          return (
            <div
              key={i}
              className={`folder-paper paper-layer-${i + 1}`}
              style={{
                backgroundColor: `hsl(var(${chartVar}))`,
                borderColor: `hsl(var(${chartVar}) / 0.8)`,
                position: 'absolute',
                width: `${paperPos.width}px`,
                height: `${paperPos.height}px`,
                top: `${paperPos.top}px`,
                left: `${paperPos.left}px`,
                zIndex: paperPos.zIndex,
              }}
            />
          );
        })}

        {/* 3. FOLDER TAB - Exact coordinates from map */}
        <div 
          className="folder-tab"
          style={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            position: 'absolute',
            width: `${LAYER_POSITIONS.tab.width}px`,
            height: `${LAYER_POSITIONS.tab.height}px`,
            top: `${LAYER_POSITIONS.tab.top}px`,
            left: `${LAYER_POSITIONS.tab.left}px`,
            zIndex: LAYER_POSITIONS.tab.zIndex,
          }}
        />

        {/* 4. FOLDER COVER - Exact coordinates from map */}
        <div 
          className="folder-cover"
          style={{
            backgroundColor: 'hsl(var(--accent))',
            borderColor: 'hsl(var(--accent) / 0.8)',
            position: 'absolute',
            width: `${LAYER_POSITIONS.cover.width}px`,
            height: `${LAYER_POSITIONS.cover.height}px`,
            top: `${LAYER_POSITIONS.cover.top}px`,
            left: `${LAYER_POSITIONS.cover.left}px`,
            zIndex: LAYER_POSITIONS.cover.zIndex,
          }}
        />

        {/* 5. FOLDER CONTENT - Exact coordinates from map */}
        <div 
          className="folder-content"
          style={{
            position: 'absolute',
            width: `${LAYER_POSITIONS.content.width}px`,
            height: `${LAYER_POSITIONS.content.height}px`,
            top: `${LAYER_POSITIONS.content.top}px`,
            left: `${LAYER_POSITIONS.content.left}px`,
            zIndex: LAYER_POSITIONS.content.zIndex,
          }}
        >
          <div 
            className="folder-info"
            style={{
              backgroundColor: 'hsl(var(--card) / 0.95)',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
            }}
          >
            <h3 className="folder-name">
              {folder.name}
            </h3>
            <p className="folder-count" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn favorite ${isFavorite ? 'active' : ''}`}
              style={{
                backgroundColor: isFavorite ? 'hsl(var(--chart-3) / 0.1)' : 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: isFavorite ? 'hsl(var(--chart-3))' : 'hsl(var(--muted-foreground))',
              }}
              title="Toggle favorite"
            >
              {isFavorite ? <StarFilledIcon /> : <StarIcon />}
            </button>
            
            <button
              onClick={handleContextMenuClick}
              className="action-btn"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
              }}
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

/* 
PRECISE COORDINATE REFERENCE:

FOLDER BACK:
- Top: 6px, Bottom: 166px, Left: 6px, Right: 206px
- Width: 200px, Height: 160px
- Z-Index: 0 (furthest back)

PAPER LAYER 1 (Green):
- Top: -3.2px, Bottom: 137.6px, Left: 6px, Right: 194px
- Width: 188px, Height: 140.8px
- Z-Index: 1 (PEEKS OUT 3.2px ABOVE folder edge)

FOLDER TAB:
- Top: -8px, Bottom: 12px, Left: 20px, Right: 80px
- Width: 60px, Height: 20px
- Z-Index: 8 (behind cover)

FOLDER COVER:
- Top: 0px, Bottom: 160px, Left: 0px, Right: 200px
- Width: 200px, Height: 160px
- Z-Index: 10 (main surface)

This gives you EXACT pixel coordinates for alignment!
*/