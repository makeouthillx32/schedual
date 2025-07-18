// components/documents/FavoritesBar/index.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { 
  StarIcon,
  FolderIcon,
  HomeIcon,
  RecentIcon,
  TrashIcon,
  SharedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  CloseIcon
} from './icons';

interface FavoriteItem {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'shortcut';
  isPinned?: boolean;
  created_at: string;
}

interface FavoritesBarProps {
  favorites: FavoriteItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onAddFavorite?: (path: string, name: string) => void;
  onRemoveFavorite?: (favoriteId: string) => void;
  onTogglePin?: (favoriteId: string) => void;
  className?: string;
}

export default function FavoritesBar({
  favorites,
  currentPath,
  onNavigate,
  onAddFavorite,
  onRemoveFavorite,
  onTogglePin,
  className = ''
}: FavoritesBarProps) {
  // Main component collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Quick access items
  const quickAccessItems = [
    {
      id: 'home',
      name: 'Home',
      path: '',
      icon: HomeIcon,
      type: 'shortcut' as const
    },
    {
      id: 'recent',
      name: 'Recent',
      path: '/recent',
      icon: RecentIcon,
      type: 'shortcut' as const
    },
    {
      id: 'shared',
      name: 'Shared',
      path: '/shared',
      icon: SharedIcon,
      type: 'shortcut' as const
    },
    {
      id: 'trash',
      name: 'Trash',
      path: '/trash',
      icon: TrashIcon,
      type: 'shortcut' as const
    }
  ];

  // Handle favorite item click
  const handleFavoriteClick = useCallback((path: string) => {
    onNavigate(path);
  }, [onNavigate]);

  // Handle remove favorite
  const handleRemoveFavorite = useCallback((e: React.MouseEvent, favoriteId: string) => {
    e.stopPropagation();
    onRemoveFavorite?.(favoriteId);
  }, [onRemoveFavorite]);

  // Toggle main component collapse
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 ease-in-out ${className}`}>
      
      {/* Always Visible Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-yellow-500" />
          <span className="text-white font-medium">Favorites</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Add Favorite Button */}
          {onAddFavorite && !isCollapsed && (
            <button
              onClick={() => {
                const folderName = prompt('Enter folder name:');
                if (folderName) {
                  onAddFavorite(currentPath, folderName);
                }
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Add current folder to favorites"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
          
          {/* Collapse/Expand Toggle */}
          <button
            onClick={toggleCollapse}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expand favorites" : "Collapse favorites"}
          >
            {isCollapsed ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      }`}>
        
        {/* Quick Access Section */}
        <div className="border-b border-gray-700">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <HomeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium uppercase tracking-wide text-gray-400">
                Quick Access
              </span>
              <span className="bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {quickAccessItems.length}
              </span>
            </div>
            
            <div className="space-y-1">
              {quickAccessItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleFavoriteClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Folders Section */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <FolderIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium uppercase tracking-wide text-gray-400">
              Folders
            </span>
            <span className="bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full text-xs">
              {favorites.length}
            </span>
          </div>
          
          <div className="space-y-1">
            {favorites.length === 0 ? (
              <div className="text-center py-6">
                <StarIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No favorite folders yet</p>
                <p className="text-xs text-gray-500 mt-1">Star folders to add them here</p>
              </div>
            ) : (
              favorites.map((favorite) => {
                const isActive = currentPath === favorite.path;
                const isHovered = hoveredItem === favorite.id;
                
                return (
                  <div
                    key={favorite.id}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(favorite.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <button
                      onClick={() => handleFavoriteClick(favorite.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <FolderIcon className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span className="truncate" title={favorite.name}>
                        {favorite.name}
                      </span>
                    </button>

                    {/* Remove button on hover */}
                    {isHovered && onRemoveFavorite && (
                      <button
                        onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-400 bg-gray-800 rounded shadow-sm transition-all duration-200"
                        title="Remove from favorites"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Collapsed State - Quick Access Icons Only */}
      {isCollapsed && (
        <div className="p-3">
          <div className="flex items-center justify-center gap-2">
            {quickAccessItems.slice(0, 4).map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleFavoriteClick(item.path)}
                  className={`p-2 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={item.name}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              );
            })}
            
            {/* Show favorites count when collapsed */}
            {favorites.length > 0 && (
              <div className="ml-2 text-xs text-gray-500">
                +{favorites.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}