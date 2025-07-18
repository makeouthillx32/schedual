// components/documents/Folder/index.tsx - PURE TAILWIND VERSION
'use client';

import React, { useState } from 'react';
import {
  FolderIcon,
  StarIcon,
  StarFilledIcon,
  MoreVerticalIcon
} from './icons';

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

    // Debug colors - keep them obvious
    return {
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
    };
  };

  const colors = getColorScheme();

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer ${
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

  // 3D Grid view - ALL TAILWIND POSITIONING
  return (
    <div
      className={`
        relative w-48 h-40 mx-auto my-5 cursor-pointer
        transition-transform duration-200 ease-out
        hover:-translate-y-1 hover:scale-105
        ${isSelected ? '-translate-y-1 scale-105' : ''}
        ${isEmpty ? 'opacity-75' : ''}
      `}
      style={{ 
        perspective: '2500px',
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      
      {/* 3D Container with hover tilt */}
      <div 
        className={`
          relative w-full h-full transition-transform duration-300 ease-out
          ${isHovered ? 'rotate-x-1 -rotate-y-1' : ''}
        `}
        style={{ 
          transformStyle: 'preserve-3d'
        }}
      >
        
        {/* 1. FOLDER BACK - Furthest back */}
        <div 
          className={`
            absolute inset-0 rounded-xl border-2 ${colors.back}
            shadow-inner shadow-lg
          `}
          style={{ 
            transform: 'translateZ(-30px)',
            zIndex: 0,
            boxShadow: 'inset 3px -4px 12px -4px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.25)'
          }}
        />

        {/* 2. PAPER LAYERS - Peek out at top/sides */}
        {colors.papers.slice(0, Math.min(fileCount, 5)).map((paperColor, layerIndex) => {
          const layer = layerIndex + 1;
          return (
            <div
              key={layerIndex}
              className={`
                absolute rounded border-2 ${paperColor}
                shadow-md
              `}
              style={{
                width: `${94 - layer * 2}%`,
                height: `${88 - layer * 2}%`,
                left: `${3 + layer}%`,
                top: `${-2 + layer * 2}%`, // Peek out at top
                transform: `translateZ(${-25 + layer * 5}px)`,
                zIndex: layer,
              }}
            />
          );
        })}

        {/* 3. FOLDER TAB - Behind cover */}
        <div 
          className={`
            absolute w-16 h-5 rounded-t-xl border-2 ${colors.tab}
            shadow-md
          `}
          style={{ 
            top: '-8px',
            left: '20px',
            transform: 'translateZ(5px)',
            zIndex: 8,
            boxShadow: '0 -3px 6px rgba(0,0,0,0.15)'
          }}
        />

        {/* 4. FOLDER COVER - In front of tab */}
        <div 
          className={`
            absolute inset-0 border-2 ${colors.cover}
            shadow-lg
          `}
          style={{ 
            borderRadius: '12px 6px 12px 12px',
            transform: 'translateZ(10px)',
            zIndex: 10,
            boxShadow: '0 6px 12px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)'
          }}
        />

        {/* 5. FOLDER CONTENT - Always on top */}
        <div 
          className={`
            absolute inset-0 flex flex-col justify-between p-4
            pointer-events-none
            bg-black/10 border-2 border-dashed border-black
          `}
          style={{ 
            transform: 'translateZ(20px)',
            zIndex: 100
          }}
        >
          
          {/* Folder Info */}
          <div className="bg-white/90 border-2 border-black rounded p-2 pointer-events-auto">
            <h3 className="text-black font-semibold text-sm leading-tight truncate">
              {folder.name}
            </h3>
            <p className="text-gray-700 text-xs">
              {fileCount} {fileCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`
            flex gap-2 self-end transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <button
              onClick={handleFavoriteToggle}
              className={`
                w-7 h-7 rounded border-2 border-black bg-white
                flex items-center justify-center
                hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg
                transition-all duration-200 pointer-events-auto
                ${isFavorite ? 'text-orange-600 bg-orange-50' : 'text-black'}
              `}
              title="Toggle favorite"
            >
              {isFavorite ? <StarFilledIcon /> : <StarIcon />}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, folder.id);
              }}
              className="
                w-7 h-7 rounded border-2 border-black bg-white text-black
                flex items-center justify-center
                hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg
                transition-all duration-200 pointer-events-auto
              "
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