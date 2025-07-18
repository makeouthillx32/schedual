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
  const [isQuickAccessExpanded, setIsQuickAccessExpanded] = useState(true);
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);

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

  // Items to show based on expansion state
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

  // Collapsible section component
  const CollapsibleSection = ({ 
    title, 
    count, 
    isExpanded, 
    onToggle, 
    children,
    icon: IconComponent 
  }: {
    title: string;
    count?: number;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span>{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
              {count}
            </span>
          )}
        </div>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {/* Animated content container */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );

  // If completely collapsed, show minimal sidebar
  if (isCollapsed) {
    return (
      <div className={`favorites-bar-collapsed bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex flex-col gap-2 p-2">
          {/* Expand toggle */}
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
          {quickAccessItems.slice(0, 2).map((item) => {
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
                <PinIcon className="absolute top-0 right-0 h-3 w-3 text-yellow-500" />
              </button>
            );
          })}

          {/* Show more indicator */}
          {(pinnedFavorites.length > 3 || regularFavorites.length > 0) && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div className="text-center">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto mb-1"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto mb-1"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`favorites-bar bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 flex flex-col h-full ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        
        {/* Quick Access Section */}
        <CollapsibleSection
          title="Quick Access"
          count={quickAccessItems.length}
          isExpanded={isQuickAccessExpanded}
          onToggle={() => setIsQuickAccessExpanded(!isQuickAccessExpanded)}
          icon={HomeIcon}
        >
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
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Pinned Favorites Section */}
        {pinnedFavorites.length > 0 && (
          <CollapsibleSection
            title="Pinned"
            count={pinnedFavorites.length}
            isExpanded={isPinnedExpanded}
            onToggle={() => setIsPinnedExpanded(!isPinnedExpanded)}
            icon={PinIcon}
          >
            <div className="space-y-1">
              {pinnedFavorites.map((favorite) => {
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
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <FolderIcon className="h-4 w-4" />
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
                        
                        {onRemoveFavorite && (
                          <button
                            onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                            className="p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow-sm"
                            title="Remove"
                          >
                            <CloseIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* Regular Folders Section */}
        {regularFavorites.length > 0 && (
          <CollapsibleSection
            title="Folders"
            count={regularFavorites.length}
            isExpanded={isFoldersExpanded}
            onToggle={() => setIsFoldersExpanded(!isFoldersExpanded)}
            icon={FolderIcon}
          >
            <div className="space-y-1">
              {visibleFavorites.map((favorite) => {
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
                        {onTogglePin && (
                          <button
                            onClick={(e) => handleTogglePin(e, favorite.id)}
                            className="p-1 text-gray-400 hover:text-yellow-500 bg-white dark:bg-gray-800 rounded shadow-sm"
                            title="Pin to top"
                          >
                            <PinIcon className="h-3 w-3" />
                          </button>
                        )}
                        
                        {onRemoveFavorite && (
                          <button
                            onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                            className="p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow-sm"
                            title="Remove"
                          >
                            <CloseIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Show more/less button */}
              {regularFavorites.length > 3 && (
                <button
                  onClick={() => setShowAllFavorites(!showAllFavorites)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {showAllFavorites ? (
                    <>
                      <ChevronUpIcon className="h-3 w-3" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-3 w-3" />
                      Show {regularFavorites.length - 3} More
                    </>
                  )}
                </button>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Empty State */}
        {favorites.length === 0 && (
          <div className="text-center py-8">
            <StarIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No favorite folders yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Star folders to add them here
            </p>
          </div>
        )}
      </div>

      {/* Footer - Add Current Folder */}
      {onAddFavorite && currentPath && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
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