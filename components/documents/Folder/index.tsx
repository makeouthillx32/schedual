// components/documents/Folder/index.tsx
'use client';

import React, { useState } from 'react';
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

  // Color schemes for different folder states
  const getColorScheme = () => {
    if (isEmpty) {
      return {
        back: 'bg-gray-300 border-gray-400',
        papers: [
          'bg-gray-200 border-gray-300',
          'bg-gray-100 border-gray-200', 
          'bg-gray-50 border-gray-100'
        ],
        cover: 'bg-blue-200 border-blue-300',
        tab: 'bg-white border-gray-400'
      };
    }

    // Color schemes based on index for variety
    const schemes = [
      {
        back: 'bg-red-500 border-red-600',
        papers: [
          'bg-green-400 border-green-500',
          'bg-blue-400 border-blue-500',
          'bg-yellow-400 border-yellow-500',
          'bg-purple-400 border-purple-500',
          'bg-orange-400 border-orange-500'
        ],
        cover: 'bg-cyan-400 border-cyan-500',
        tab: 'bg-white border-gray-800'
      },
      {
        back: 'bg-indigo-500 border-indigo-600',
        papers: [
          'bg-pink-400 border-pink-500',
          'bg-teal-400 border-teal-500',
          'bg-lime-400 border-lime-500',
          'bg-rose-400 border-rose-500',
          'bg-amber-400 border-amber-500'
        ],
        cover: 'bg-emerald-400 border-emerald-500',
        tab: 'bg-white border-gray-800'
      },
      {
        back: 'bg-violet-500 border-violet-600',
        papers: [
          'bg-sky-400 border-sky-500',
          'bg-fuchsia-400 border-fuchsia-500',
          'bg-emerald-400 border-emerald-500',
          'bg-red-400 border-red-500',
          'bg-blue-400 border-blue-500'
        ],
        cover: 'bg-yellow-400 border-yellow-500',
        tab: 'bg-white border-gray-800'
      }
    ];

    return schemes[index % schemes.length];
  };

  const colors = getColorScheme();

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={`folder-list-item bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-500">
            <FolderIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {folder.name}
            </h3>
            <p className="text-sm text-gray-500">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`p-1 rounded transition-colors ${
              isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
        </div>
      </div>
    );
  }

  // 3D Grid view
  return (
    <div
      className={`folder-container ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="folder-3d">
        
        {/* 1. FOLDER BACK - Furthest back layer */}
        <div className={`folder-back ${colors.back} border-2`}></div>

        {/* 2. PAPER LAYERS - Middle layers */}
        {colors.papers.slice(0, Math.min(fileCount, 5)).map((paperColor, layerIndex) => (
          <div
            key={layerIndex}
            className={`folder-paper paper-layer-${layerIndex + 1} ${paperColor} border-2`}
          ></div>
        ))}

        {/* 3. FOLDER COVER - Front but behind content */}
        <div className={`folder-cover ${colors.cover} border-2`}>
          {/* 4. FOLDER TAB - Inside cover */}
          <div className={`folder-tab ${colors.tab} border-2`}></div>
        </div>

        {/* 5. FOLDER CONTENT - Always on top */}
        <div className="folder-content bg-black/10 border-2 border-dashed border-black">
          <div className="folder-info bg-white/90 border-2 border-black rounded p-2">
            <h3 className="folder-name text-black font-semibold text-sm leading-tight">
              {folder.name}
            </h3>
            <p className="folder-count text-gray-700 text-xs">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className={`folder-actions flex gap-2 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn bg-white border-2 border-black rounded w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                isFavorite ? 'text-orange-600 bg-orange-50' : 'text-black'
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
              className="action-btn bg-white border-2 border-black rounded w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-lg text-black"
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