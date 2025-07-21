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
  onNavigate,
  onToggleFavorite,
  onContextMenu,
  onSelect
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);

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
        className="folder-list-item"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-3">
          <div className="folder-icon-small">
            <FolderIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">{folder.name}</h3>
            <p className="text-sm text-gray-500">{fileCount} items</p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`p-1 rounded ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
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
        <div className="folder-back"></div>
        
        {/* Dynamic Paper Layers */}
        {Array.from({ length: paperLayers }, (_, index) => (
          <div 
            key={index}
            className="folder-paper"
            style={{
              transform: `translateZ(${(index + 1) * 2}px) translateY(-${index * 1}px)`,
              opacity: 0.9 - (index * 0.1),
              zIndex: index + 1
            }}
          />
        ))}
        
        {/* Folder Cover */}
        <div 
          className="folder-cover"
          style={{
            transform: `translateZ(${paperLayers * 2 + 5}px)`,
            zIndex: paperLayers + 10
          }}
        >
          {/* Folder Tab */}
          <div className="folder-tab"></div>
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
            <h3 className="folder-name">{folder.name}</h3>
            <p className="folder-count">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn favorite ${isFavorite ? 'active' : ''}`}
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