// components/documents/Folder/index.tsx
'use client';

import React, { useState } from 'react';
import { Star, MoreVertical } from 'lucide-react';

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
      <div className="folder-list-item p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
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
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`folder-container ${isSelected ? 'selected' : ''}`}
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
              opacity: 0.9 - (index * 0.1)
            }}
          />
        ))}
        
        {/* Folder Cover */}
        <div className="folder-cover">
          {/* Folder Tab */}
          <div className="folder-tab"></div>
        </div>
        
        {/* Folder Content Overlay */}
        <div className="folder-content">
          <div className="folder-info">
            <h3 className="folder-name">{folder.name}</h3>
            <p className="folder-count">{fileCount} items</p>
          </div>
          
          {/* Action Buttons */}
          <div className={`folder-actions ${isHovered ? 'visible' : ''}`}>
            <button
              onClick={handleFavoriteToggle}
              className={`action-btn favorite ${isFavorite ? 'active' : ''}`}
              title="Toggle favorite"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, folder.id);
              }}
              className="action-btn more"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .folder-container {
          position: relative;
          perspective: 2500px;
          margin: 20px auto;
          width: 200px;
          height: 160px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .folder-container:hover {
          transform: translateY(-5px);
        }
        
        .folder-container.selected {
          transform: translateY(-5px) scale(1.05);
        }
        
        .folder-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        
        .folder-container:hover .folder-3d {
          transform: rotateX(5deg) rotateY(-5deg);
        }
        
        /* Folder Back */
        .folder-back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: calc(var(--radius) * 1.5);
          background: linear-gradient(135deg, 
            hsl(var(--warning)) 0%, 
            hsl(var(--warning) / 0.8) 50%, 
            hsl(var(--warning) / 0.6) 100%
          );
          box-shadow: 
            inset 2px -3px 8px -3px hsl(var(--foreground) / 0.3),
            0 8px 16px hsl(var(--foreground) / 0.2);
          transform: translateZ(-10px);
        }
        
        /* Dynamic Paper Layers */
        .folder-paper {
          position: absolute;
          width: 90%;
          height: 85%;
          left: 5%;
          top: 10%;
          background: hsl(var(--card));
          border-radius: var(--radius);
          box-shadow: 0 2px 4px hsl(var(--foreground) / 0.1);
          border: 1px solid hsl(var(--border));
          transform-style: preserve-3d;
        }
        
        /* Folder Cover */
        .folder-cover {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: calc(var(--radius) * 1.5) var(--radius) calc(var(--radius) * 1.5) calc(var(--radius) * 1.5);
          background: linear-gradient(135deg, 
            hsl(var(--warning) / 0.9) 0%, 
            hsl(var(--warning)) 50%, 
            hsl(var(--warning) / 0.8) 100%
          );
          box-shadow: 
            0 4px 8px hsl(var(--foreground) / 0.2),
            inset 0 2px 4px hsl(var(--background) / 0.3);
          transform: translateZ(${paperLayers * 2 + 5}px);
        }
        
        /* Folder Tab */
        .folder-tab {
          position: absolute;
          top: -8px;
          left: 20px;
          width: 60px;
          height: 20px;
          background: linear-gradient(135deg, 
            hsl(var(--warning) / 0.9) 0%, 
            hsl(var(--warning)) 100%
          );
          border-radius: calc(var(--radius) * 1.5) calc(var(--radius) * 1.5) 0 0;
          box-shadow: 
            0 -2px 4px hsl(var(--foreground) / 0.1),
            inset 0 1px 2px hsl(var(--background) / 0.3);
        }
        
        /* Folder Content Overlay */
        .folder-content {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          transform: translateZ(${paperLayers * 2 + 10}px);
          pointer-events: none;
        }
        
        .folder-info {
          pointer-events: auto;
        }
        
        .folder-name {
          font-size: 14px;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0 0 4px 0;
          text-shadow: 0 1px 2px hsl(var(--background) / 0.8);
          line-height: 1.2;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .folder-count {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          margin: 0;
          text-shadow: 0 1px 2px hsl(var(--background) / 0.8);
        }
        
        /* Action Buttons */
        .folder-actions {
          display: flex;
          gap: 8px;
          align-self: flex-end;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: auto;
        }
        
        .folder-actions.visible {
          opacity: 1;
        }
        
        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius);
          border: none;
          background: hsl(var(--card) / 0.9);
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px hsl(var(--foreground) / 0.1);
          border: 1px solid hsl(var(--border));
        }
        
        .action-btn:hover {
          background: hsl(var(--card));
          transform: translateY(-1px);
          box-shadow: 0 4px 8px hsl(var(--foreground) / 0.15);
          color: hsl(var(--foreground));
        }
        
        .action-btn.favorite.active {
          color: hsl(var(--warning));
          background: hsl(var(--warning) / 0.1);
        }
        
        .action-btn.favorite.active:hover {
          background: hsl(var(--warning) / 0.2);
        }
        
        /* Empty Folder State */
        .folder-container.empty .folder-cover {
          background: linear-gradient(135deg, 
            hsl(var(--muted)) 0%, 
            hsl(var(--muted) / 0.8) 50%, 
            hsl(var(--muted) / 0.6) 100%
          );
        }
        
        .folder-container.empty .folder-tab {
          background: linear-gradient(135deg, 
            hsl(var(--muted)) 0%, 
            hsl(var(--muted) / 0.8) 100%
          );
        }
        
        .folder-container.empty .folder-back {
          background: linear-gradient(135deg, 
            hsl(var(--muted) / 0.8) 0%, 
            hsl(var(--muted) / 0.6) 50%, 
            hsl(var(--muted) / 0.4) 100%
          );
        }
        
        /* Selected State */
        .folder-container.selected .folder-cover {
          background: linear-gradient(135deg, 
            hsl(var(--primary)) 0%, 
            hsl(var(--primary) / 0.8) 50%, 
            hsl(var(--primary) / 0.6) 100%
          );
        }
        
        .folder-container.selected .folder-tab {
          background: linear-gradient(135deg, 
            hsl(var(--primary)) 0%, 
            hsl(var(--primary) / 0.8) 100%
          );
        }
        
        .folder-container.selected .folder-back {
          background: linear-gradient(135deg, 
            hsl(var(--primary) / 0.8) 0%, 
            hsl(var(--primary) / 0.6) 50%, 
            hsl(var(--primary) / 0.4) 100%
          );
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .folder-container {
            width: 150px;
            height: 120px;
          }
          
          .folder-name {
            font-size: 12px;
          }
          
          .folder-count {
            font-size: 10px;
          }
          
          .action-btn {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
}

// Simple fallback icon component
function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  );
}