// components/documents/Toolbar/index.tsx - Enhanced with Public Folder Management
'use client';

import React, { useState, useCallback } from 'react';
import { usePublicFolders } from '@/hooks/usePublicFolders';
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
  RefreshIcon,
  Globe,
  Lock,
  Copy,
  Code,
  Link,
  Settings
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

  // Current folder context
  currentPath?: string;
  currentFolderId?: string;
  isCurrentFolderPublic?: boolean;

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
  currentPath,
  currentFolderId,
  isCurrentFolderPublic = false,
  isUploading = false,
  isLoading = false,
  className = ''
}: ToolbarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPublicFolderMenu, setShowPublicFolderMenu] = useState(false);
  const [showPublicFolderManager, setShowPublicFolderManager] = useState(false);

  // Public folder management
  const {
    publicFolders,
    makefolderPublic,
    makeFolderPrivate,
    generateFolderSlug,
    getPublicAssetUrl,
    copyFolderUrl,
    generateUsageExample,
    loading: publicFolderLoading,
    error: publicFolderError
  } = usePublicFolders();

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

  // Handle making current folder public
  const handleMakeCurrentFolderPublic = useCallback(async () => {
    if (!currentFolderId) return;
    
    try {
      const folderName = currentPath?.split('/').pop() || 'folder';
      const customSlug = prompt(`Enter a URL-friendly slug for this folder:\n\nSuggested: ${generateFolderSlug(folderName)}`, generateFolderSlug(folderName));
      
      if (customSlug !== null) {
        await makefolderPublic(currentFolderId, customSlug || undefined);
        setShowPublicFolderMenu(false);
      }
    } catch (err) {
      alert('Failed to make folder public: ' + (err as Error).message);
    }
  }, [currentFolderId, currentPath, makefolderPublic, generateFolderSlug]);

  // Handle making current folder private
  const handleMakeCurrentFolderPrivate = useCallback(async () => {
    if (!currentFolderId) return;
    
    if (confirm('Are you sure you want to make this folder private? All images will no longer be publicly accessible.')) {
      try {
        await makeFolderPrivate(currentFolderId);
        setShowPublicFolderMenu(false);
      } catch (err) {
        alert('Failed to make folder private: ' + (err as Error).message);
      }
    }
  }, [currentFolderId, makeFolderPrivate]);

  // Handle copying current folder URL
  const handleCopyCurrentFolderUrl = useCallback(() => {
    const publicFolder = publicFolders.find(f => f.id === currentFolderId);
    if (publicFolder) {
      copyFolderUrl(publicFolder.public_slug);
      setShowPublicFolderMenu(false);
    }
  }, [publicFolders, currentFolderId, copyFolderUrl]);

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

            {/* Public Folder Status Indicator */}
            {currentFolderId && isCurrentFolderPublic && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg text-sm font-medium">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">Public Folder</span>
              </div>
            )}
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
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Public Folder Quick Actions */}
          {currentFolderId && (
            <div className="relative">
              <button
                onClick={() => setShowPublicFolderMenu(!showPublicFolderMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  isCurrentFolderPublic
                    ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isCurrentFolderPublic ? 'Public folder options' : 'Make folder public'}
              >
                {isCurrentFolderPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>

              {showPublicFolderMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {isCurrentFolderPublic ? 'Public Folder Options' : 'Make Folder Public'}
                    </h4>
                    
                    {isCurrentFolderPublic ? (
                      <div className="space-y-2">
                        <button
                          onClick={handleCopyCurrentFolderUrl}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Public URL
                        </button>
                        <button
                          onClick={() => {
                            const publicFolder = publicFolders.find(f => f.id === currentFolderId);
                            if (publicFolder) {
                              navigator.clipboard.writeText(generateUsageExample(publicFolder.public_slug));
                              setShowPublicFolderMenu(false);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <Code className="h-4 w-4" />
                          Copy Usage Code
                        </button>
                        <button
                          onClick={() => {
                            const publicFolder = publicFolders.find(f => f.id === currentFolderId);
                            if (publicFolder) {
                              window.open(getPublicAssetUrl(publicFolder.public_slug, ''), '_blank');
                              setShowPublicFolderMenu(false);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <Link className="h-4 w-4" />
                          View Public Assets
                        </button>
                        <hr className="border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={handleMakeCurrentFolderPrivate}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <Lock className="h-4 w-4" />
                          Make Private
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Make this folder public to access images via clean URLs on your website.
                        </p>
                        <button
                          onClick={handleMakeCurrentFolderPublic}
                          disabled={publicFolderLoading}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md disabled:opacity-50"
                        >
                          <Globe className="h-4 w-4" />
                          {publicFolderLoading ? 'Making Public...' : 'Make Public'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Sort options"
            >
              <SortIcon className="h-4 w-4" />
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
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
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
                      setShowPublicFolderManager(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <Globe className="h-4 w-4" />
                    Manage Public Folders
                  </button>
                  
                  <button
                    onClick={() => {
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

      {/* Public Folder Manager Modal */}
      {showPublicFolderManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-4xl mx-4 h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Public Folder Manager
              </h2>
              <button
                onClick={() => setShowPublicFolderManager(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-auto h-full">
              {/* Import the PublicFolderManager component here */}
              <div className="text-center text-gray-500">
                Public Folder Manager Component will be rendered here
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(showSortMenu || showFilterMenu || showMoreMenu || showPublicFolderMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowSortMenu(false);
            setShowFilterMenu(false);
            setShowMoreMenu(false);
            setShowPublicFolderMenu(false);
          }}
        />
      )}

      {/* Error Display */}
      {publicFolderError && (
        <div className="border-t border-red-200 dark:border-red-800 px-4 py-3 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{publicFolderError}</p>
        </div>
      )}
    </div>
  );
}