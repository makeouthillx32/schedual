// components/documents/Folder/index.tsx - REACT THREE FIBER VERSION
'use client';

import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Plane } from '@react-three/drei';
import { Mesh } from 'three';
import {
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

// 3D Folder Scene Component
function Folder3DScene({ 
  folder, 
  isHovered, 
  isSelected, 
  isFavorite,
  onToggleFavorite,
  onContextMenu 
}: {
  folder: FolderProps['folder'];
  isHovered: boolean;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const groupRef = useRef<any>();
  const fileCount = folder.fileCount ?? 3;

  // Paper colors
  const paperColors = ['#4ade80', '#3b82f6', '#eab308', '#a855f7', '#f97316'];

  return (
    <group 
      ref={groupRef}
      rotation={isHovered ? [0.1, -0.1, 0] : [0, 0, 0]}
      scale={isSelected ? 1.05 : 1}
    >
      {/* 1. FOLDER BACK - Red, furthest back */}
      <Plane 
        args={[4, 3]} 
        position={[0, 0, -1.5]}
      >
        <meshBasicMaterial color="#ef4444" />
      </Plane>

      {/* 2. PAPER LAYERS - Colorful, peeking out */}
      {Array.from({ length: Math.min(fileCount, 5) }, (_, i) => (
        <Plane
          key={i}
          args={[3.8 - i * 0.1, 2.8 - i * 0.1]}
          position={[
            0.05 + i * 0.05, // Slight offset right
            0.1 + i * 0.05,  // Peek out at top
            -1.0 + i * 0.2   // Layer depth
          ]}
        >
          <meshBasicMaterial color={paperColors[i]} />
        </Plane>
      ))}

      {/* 3. FOLDER TAB - White, behind cover */}
      <Plane 
        args={[1.2, 0.4]} 
        position={[-0.8, 1.2, 0.8]}
      >
        <meshBasicMaterial color="#ffffff" />
      </Plane>

      {/* 4. FOLDER COVER - Cyan, in front of tab */}
      <Plane 
        args={[4, 3]} 
        position={[0, 0, 1]}
      >
        <meshBasicMaterial color="#22d3ee" />
      </Plane>

      {/* 5. FOLDER CONTENT - HTML overlay on top */}
      <Html
        position={[0, 0, 1.1]}
        center
        distanceFactor={10}
        style={{
          width: '200px',
          height: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          pointerEvents: 'none'
        }}
      >
        {/* Folder Info */}
        <div 
          className="bg-white/90 border-2 border-black rounded p-2"
          style={{ pointerEvents: 'auto' }}
        >
          <h3 className="text-black font-semibold text-sm leading-tight truncate">
            {folder.name}
          </h3>
          <p className="text-gray-700 text-xs">
            {fileCount} {fileCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Action Buttons */}
        <div 
          className={`flex gap-2 self-end transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          <button
            onClick={onToggleFavorite}
            className={`
              w-7 h-7 rounded border-2 border-black bg-white
              flex items-center justify-center
              hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-200
              ${isFavorite ? 'text-orange-600 bg-orange-50' : 'text-black'}
            `}
            title="Toggle favorite"
          >
            {isFavorite ? <StarFilledIcon /> : <StarIcon />}
          </button>
          
          <button
            onClick={onContextMenu}
            className="
              w-7 h-7 rounded border-2 border-black bg-white text-black
              flex items-center justify-center
              hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-200
            "
            title="More options"
          >
            <MoreVerticalIcon />
          </button>
        </div>
      </Html>
    </group>
  );
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

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
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

  // List view - keep as regular HTML
  if (viewMode === 'list') {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, folder.id)}
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-500">
            {/* You'll need to implement FolderIcon for list view */}
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {folder.name}
            </h3>
            <p className="text-sm text-gray-500">
              {folder.fileCount ?? 0} {(folder.fileCount ?? 0) === 1 ? 'item' : 'items'}
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

  // 3D Grid view with React Three Fiber
  return (
    <div
      className="w-48 h-40 mx-auto my-5 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, folder.id)}
    >
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 50 
        }}
        style={{ 
          width: '100%', 
          height: '100%' 
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 2]} intensity={0.5} />
        
        <Folder3DScene
          folder={folder}
          isHovered={isHovered}
          isSelected={isSelected}
          isFavorite={isFavorite}
          onToggleFavorite={handleFavoriteToggle}
          onContextMenu={handleContextMenuClick}
        />
      </Canvas>
    </div>
  );
}