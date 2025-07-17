// components/Docustore/Toolbar/index.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { 
  SearchIcon,
  PlusIcon,
  UploadIcon,
  GridIcon,
  ListIcon,
  FilterIcon,
  SortIcon,
  MoreIcon,
  FolderIcon,
  StarIcon,
  ShareIcon,
  RefreshIcon
} from './icons';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

interface ToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // View controls
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  // Actions
  onUpload: () => void;
  onCreateFolder: () => void;
  onRefresh?: () => void;

  // Sorting
  sortBy: SortOption;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortOption, order: SortOrder) => void;

  // Filtering
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  
  // Selection
  selectedCount: number;
  onClearSelection?: () => void;
  onSelectAll?: () => void;

  // Status
  isUploading?: boolean;
  isLoading?: boolean;
  
  className?: string;
}

export default function Toolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search documents...",
  viewMode,
  onViewModeChange,
  onUpload,
  onCreateFolder,
  onRefresh,
  sortBy,
  sortOrder,
  onSortChange,
  showFavoritesOnly,
  onToggleFavorites,
  selectedCount,
  onClearSelection,
  onSelectAll,
  isUploading = false,
  isLoading = false,
  className = ''
}: ToolbarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Sort options
  const sortOptions = [
    { value: 'name' as SortOption, label: 'Name' },
    { value: 'date' as SortOption, label: 'Date Modified' },
    { value: 'size' as SortOption, label: 'Size' },
    { value: 'type' as SortOption, label: 'Type' }
  ];

  // Handle sort selection
  const handleSortSelect = useCallback((newSortBy: SortOption) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newOrder);
    setShowSortMenu(false);
  }, [sortBy, sortOrder, onSortChange]);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Clear search
  const clearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className={`toolbar bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      
      {/* Main Toolbar Row */}
      <div className="flex items-center justify-between p-4">
        
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onToggleFavorites}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <StarIcon className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden md:inline">Favorites</span>
            </button>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Sort options"
            >
              <SortIcon className="h-4 w-4" />
              <span className="hidden lg:inline text-sm">Sort</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortSelect(option.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        sortBy === option.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Menu */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Filter options"
            >
              <FilterIcon className="h-4 w-4" />
              <span className="hidden lg:inline text-sm">Filter</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by</h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showFavoritesOnly}
                        onChange={onToggleFavorites}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Favorites only
                      </span>
                    </label>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">File Types</p>
                      <div className="space-y-1">
                        {['Images', 'Documents', 'Videos', 'Archives'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="More options"
            >
              <MoreIcon className="h-4 w-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {onSelectAll && (
                    <button
                      onClick={() => {
                        onSelectAll();
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Select All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Handle export functionality
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Export Selection
                  </button>
                  <button
                    onClick={() => {
                      // Handle share functionality
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share Folder
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={onCreateFolder}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="New folder"
            >
              <FolderIcon className="h-4 w-4" />
              <span className="hidden xl:inline text-sm">New Folder</span>
            </button>

            <button
              onClick={onUpload}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isUploading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              title="Upload files"
            >
              <UploadIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isUploading ? 'Uploading...' : 'Upload'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Selection Bar (shown when items are selected) */}
      {selectedCount > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <ShareIcon className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <StarIcon className="h-4 w-4" />
                Favorite
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(showSortMenu || showFilterMenu || showMoreMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowSortMenu(false);
            setShowFilterMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}
    </div>
  );
}