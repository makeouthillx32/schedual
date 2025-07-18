// components/documents/Folder/index.tsx
'use client';

import React, { useState } from 'react';
import {
  FolderIcon,
  StarIcon,
  StarFilledIcon,
  MoreVerticalIcon,
} from './icons';
import './styles.css';

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
    fileCount?: number; // populated by your API, optional
  };
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  index?: number;      // made optional
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
  index = 0,             // default to 0
  onNavigate,
  onToggleFavorite,
  onContextMenu,
  onSelect,
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const fileCount = folder.fileCount ?? 0;
  const paperLayers = Math.min(Math.max(fileCount, 0), 5);
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

  // LIST VIEW
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
            <p className="text-sm text-gray-500">{fileCount} items</p>
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

  // GRID / 3D VIEW
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
        {/* Back panel */}
        <div className="folder-back" />

        {/* Paper layers */}
        {Array.from({ length: paperLayers }, (_, layerIndex) => {
          const z = (layerIndex + 1) * 2;
          const y = layerIndex * 1;
          const rot = (layerIndex - (paperLayers - 1) / 2) * 1; // slight spread
          const opacity = 0.9 - layerIndex * 0.1;
          return (
            <div
              key={layerIndex}
              className="folder-paper"
              style={{
                transform: `translateZ(${z}px) translateY(-${y}px) rotateZ(${rot}deg)`,
                opacity,
                zIndex: layerIndex + 1,
              }}
            />
          );
        })}

        {/* Cover & Tab */}
        <div
          className="folder-cover"
          style={{
            transform: `translateZ(${paperLayers * 2 + 5}px)`,
            zIndex: paperLayers + 10,
          }}
        >
          <div className="folder-tab" />
        </div>

        {/* Content Overlay */}
        <div
          className="folder-content"
          style={{
            transform: `translateZ(${paperLayers * 2 + 10}px)`,
            zIndex: paperLayers + 20,
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