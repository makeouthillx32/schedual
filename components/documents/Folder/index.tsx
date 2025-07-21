'use client';

import React, { useState } from 'react';
import {
  StarIcon,
  StarFilledIcon,
  MoreVerticalIcon,
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
  onSelect,
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileCount = folder.fileCount ?? 3;
  const isEmpty = fileCount === 0;

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.folder-actions')) return;
    if (e.ctrlKey || e.metaKey) onSelect(folder.id, true);
    else onNavigate(folder.path);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(folder.path, folder.name);
  };

  const handleContextMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, folder.id);
  };

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
            color: isFavorite
              ? 'hsl(var(--chart-3))'
              : 'hsl(var(--muted-foreground))',
          }}
        >
          {isFavorite ? <StarFilledIcon /> : <StarIcon />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative w-48 h-32 mx-auto my-8 cursor-pointer transition-transform duration-200 ${
        isHovered ? '-translate-y-1' : ''
      } ${isSelected ? '-translate-y-1 scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, folder.id)}
    >
      {/* Folder Back */}
      <div
        className="absolute rounded-xl border-2 shadow-lg"
        style={{
          backgroundColor: 'hsl(var(--destructive))',
          borderColor: 'hsl(var(--destructive) / 0.8)',
          width: '100%',
          height: '100%',
          top: '6px',
          left: '6px',
          zIndex: 0,
        }}
      />

      {/* Paper Layers */}
      {Array.from({ length: Math.min(fileCount, 5) }, (_, i) => {
        const chartVar = `--chart-${i + 1}`;
        return (
          <div
            key={i}
            className="absolute rounded border-2"
            style={{
              backgroundColor: `hsl(var(${chartVar}))`,
              borderColor: `hsl(var(${chartVar}) / 0.8)`,
              width: `${94 - i * 2}%`,
              height: `${90 - i * 2}%`,
              top: `${-3 - i * 2}px`,
              left: `${2 + i * 2}%`,
              zIndex: 1 + i,
            }}
          />
        );
      })}

      {/* Folder Tab */}
      <div
        className="absolute rounded-t-xl border-2 border-b-0"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))',
          width: '64px',
          height: '24px',
          top: '-12px',
          left: '20px',
          zIndex: 8,
        }}
      />

      {/* Folder Cover */}
      <div
        className="absolute border-2 shadow-md"
        style={{
          backgroundColor: 'hsl(var(--accent))',
          borderColor: 'hsl(var(--accent) / 0.8)',
          width: '100%',
          height: '100%',
          top: '0px',
          left: '0px',
          borderRadius: '12px 6px 12px 12px',
          zIndex: 10,
        }}
      />

      {/* Folder Content */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div
          className="rounded p-2 border pointer-events-auto"
          style={{
            backgroundColor: 'hsl(var(--card) / 0.95)',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--card-foreground))',
          }}
        >
          <h3 className="font-semibold text-sm leading-tight truncate">
            {folder.name}
          </h3>
          <p
            className="text-xs"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {fileCount} {fileCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Actions */}
        <div
          className={`flex gap-2 self-end transition-opacity duration-200 pointer-events-auto ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handleFavoriteToggle}
            className="w-8 h-8 rounded border flex items-center justify-center hover:scale-105 transition-all"
            style={{
              backgroundColor: isFavorite
                ? 'hsl(var(--chart-3) / 0.1)'
                : 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              color: isFavorite
                ? 'hsl(var(--chart-3))'
                : 'hsl(var(--muted-foreground))',
            }}
            title="Toggle favorite"
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>

          <button
            onClick={handleContextMenuClick}
            className="w-8 h-8 rounded border flex items-center justify-center hover:scale-105 transition-all"
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
  );
}