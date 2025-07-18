// components/documents/Folder/index.tsx
'use client';

import React, { useState } from 'react';
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
    fileCount?: number;    // number of files, from your API
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

  const fileCount = folder.fileCount ?? 0;
  const isEmpty = fileCount === 0;

  const handleClick = (e: React.MouseEvent) => {
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

  // —— List view —— 
  if (viewMode === 'list') {
    return (
      <div
        className="folder-list-item"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-3">
          <div className="folder-icon-small">
            <FolderIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {folder.name}
            </h3>
            <p className="text-sm text-gray-500">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`p-1 rounded ${
              isFavorite ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
        </div>
      </div>
    );
  }

  // —— Grid / 3D view —— 
  return (
    <div
      className={`folder-container chart-${index % 5 + 1} ${
        isSelected ? 'selected' : ''
      } ${isEmpty ? 'empty' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="folder-3d">
        
        {/* 1. FOLDER BACK - Uses CSS z-index: 0 */}
        <div className="folder-back"></div>

        {/* 2. PAPER LAYERS - Uses CSS z-index: 1-5 */}
        <div className="folder-paper paper-layer-1"></div>
        <div className="folder-paper paper-layer-2"></div>
        <div className="folder-paper paper-layer-3"></div>
        <div className="folder-paper paper-layer-4"></div>
        <div className="folder-paper paper-layer-5"></div>

        {/* 3. FOLDER COVER - Uses CSS z-index: 10 */}
        <div className="folder-cover">
          {/* 4. FOLDER TAB - Child of cover, uses relative positioning */}
          <div className="folder-tab"></div>
        </div>

        {/* 5. FOLDER CONTENT - Uses CSS z-index: 100 */}
        <div className="folder-content">
          <div className="folder-info">
            <h3 className="folder-name">{folder.name}</h3>
            <p className="folder-count">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn favorite ${
                isFavorite ? 'active' : ''
              }`}
              title="Toggle favorite"
            >
              {isFavorite ? <StarFilledIcon /> : <StarIcon />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, folder.id);
              }}
              className="action-btn more"
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