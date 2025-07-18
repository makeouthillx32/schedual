// components/Docustore/FavoritesBar/index.tsx
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
  PlusIcon,
  CloseIcon,
  PinIcon
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export default function FavoritesBar({
  favorites,
  currentPath,
  onNavigate,
  onAddFavorite,
  onRemoveFavorite,
  onTogglePin,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}: FavoritesBarProps) {
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Quick access items (always shown)
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

  // Pinned favorites (shown prominently)
  const pinnedFavorites = favorites.filter(fav => fav.isPinned);
  
  // Regular favorites
  const regularFavorites = favorites.filter(fav => !fav.isPinned);

  // Items to show in collapsed view
  const visibleFavorites = showAllFavorites ? regularFavorites : regularFavorites.slice(0, 3);

  // Handle favorite item click
  const handleFavoriteClick = useCallback((path: string) => {
    onNavigate(path);
  }, [onNavigate]);

  // Handle remove favorite
  const handleRemoveFavorite = useCallback((e: React.MouseEvent, favoriteId: string) => {
    e.stopPropagation();
    onRemoveFavorite?.(favoriteId);
  }, [onRemoveFavorite]);

  // Handle toggle pin
  const handleTogglePin = useCallback((e: React.MouseEvent, favoriteId: string) => {
    e.stopPropagation();
    onTogglePin?.(favoriteId);
  }, [onTogglePin]);

  // Truncate long folder names
  const truncateName = (name: string, maxLength: number = 15) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  if (isCollapsed) {
    return (
      <div className={`favorites-bar-collapsed ${className}`}>
        <div className="flex flex-col gap-2 p-2">
          {/* Collapse toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Expand favorites"
            >
              <ChevronDownIcon className="h-4 w-4 rotate-90" />
            </button>
          )}

          {/* Quick access icons only */}
          {quickAccessItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleFavoriteClick(item.path)}
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={item.name}
              >
                <IconComponent className="h-5 w-5" />
              </button>
            );
          })}

          {/* Pinned favorites icons */}
          {pinnedFavorites.slice(0, 3).map((favorite) => {
            const isActive = currentPath === favorite.path;
            
            return (
              <button
                key={favorite.id}
                onClick={() => handleFavoriteClick(favorite.path)}
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={favorite.name}
              >
                <FolderIcon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`favorites-bar bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">Favorites</h3>
        </div>
        
        <div className="flex items-center gap-1">
          {onAddFavorite && (
            <button
              onClick={() => {
                const folderName = prompt('Enter folder name:');
                if (folderName) {
                  onAddFavorite(currentPath, folderName);
                }
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Add current folder to favorites"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
          
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Collapse favorites"
            >
              <ChevronDownIcon className="h-4 w-4 -rotate-90" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div className="p-3">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Quick Access
        </h4>
        
        <div className="space-y-1">
          {quickAccessItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleFavoriteClick(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Favorites */}
      {pinnedFavorites.length > 0 && (
        <div className="px-3 pb-3">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Pinned
          </h4>
          
          <div className="space-y-1">
            {pinnedFavorites.map((favorite) => {
              const isActive = currentPath === favorite.path;
              const isHovered = hoveredItem === favorite.id;
              
              return (
                <div
                  key={favorite.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredItem(favorite.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={() => handleFavoriteClick(favorite.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="relative">
                      <FolderIcon className="h-4 w-4 flex-shrink-0" />
                      <PinIcon className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="truncate" title={favorite.name}>
                      {truncateName(favorite.name)}
                    </span>
                  </button>

                  {/* Action buttons on hover */}
                  {isHovered && (
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        onClick={(e) => handleTogglePin(e, favorite.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded shadow-sm"
                        title="Unpin"
                      >
                        <PinIcon className="h-3 w-3" />
                      </button>
                      
                      <button
                        onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                        className="p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow-sm"
                        title="Remove"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Favorites */}
      {regularFavorites.length > 0 && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Folders
            </h4>
            
            {regularFavorites.length > 3 && (
              <button
                onClick={() => setShowAllFavorites(!showAllFavorites)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showAllFavorites ? 'Show Less' : `+${regularFavorites.length - 3} more`}
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {visibleFavorites.map((favorite) => {
              const isActive = currentPath === favorite.path;
              const isHovered = hoveredItem === favorite.id;
              
              return (
                <div
                  key={favorite.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredItem(favorite.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={() => handleFavoriteClick(favorite.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FolderIcon className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                    <span className="truncate" title={favorite.name}>
                      {truncateName(favorite.name)}
                    </span>
                  </button>

                  {/* Action buttons on hover */}
                  {isHovered && (
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        onClick={(e) => handleTogglePin(e, favorite.id)}
                        className="p-1 text-gray-400 hover:text-yellow-500 bg-white dark:bg-gray-800 rounded shadow-sm"
                        title="Pin to top"
                      >
                        <PinIcon className="h-3 w-3" />
                      </button>
                      
                      <button
                        onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                        className="p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow-sm"
                        title="Remove"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="px-3 pb-3">
          <div className="text-center py-8">
            <StarIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No favorite folders yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Star folders to add them here
            </p>
          </div>
        </div>
      )}

      {/* Footer - Add Current Folder */}
      {onAddFavorite && currentPath && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 mt-auto">
          <button
            onClick={() => {
              const folderName = currentPath.split('/').filter(Boolean).pop() || 'Root';
              onAddFavorite(currentPath, folderName);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <StarIcon className="h-4 w-4" />
            <span>Add to Favorites</span>
          </button>
        </div>
      )}
    </div>
  );
}