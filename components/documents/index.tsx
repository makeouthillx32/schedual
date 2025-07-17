import React, { useState, useCallback, useEffect } from 'react';
import { 
  useDocuments, 
  useFileUpload, 
  useFolderFavorites 
} from '@/hooks/useDocuments';
import { 
  DocumentSkeleton, 
  HeaderSkeleton, 
  UploadSkeleton 
} from './Skeleton';
import { 
  FileIcon, 
  FolderIcon, 
  StatusIcon, 
  ActionIcon, 
  NavIcon,
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  Star, 
  Upload,
  Folder,
  File,
  Home,
  ChevronRight,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Share,
  Eye,
  Heart,
  Filter
} from './icons';

// Mock theme context - replace with your actual theme hook
const useTheme = () => ({ isDark: false });

interface DocumentsProps {
  className?: string;
}

export default function Documents({ className = '' }: DocumentsProps) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    documentId: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    documents,
    loading,
    error,
    currentPath,
    navigateToFolder,
    createFolder,
    updateDocument,
    deleteDocument,
    moveDocument,
    searchDocuments,
    fetchDocuments
  } = useDocuments();

  const { uploadFiles, isUploading, uploads, clearUploads, cancelUpload } = useFileUpload();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFolderFavorites();

  // Generate breadcrumb from current path
  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchDocuments(query, currentPath);
    } else {
      await fetchDocuments();
    }
  }, [searchDocuments, fetchDocuments, currentPath]);

  // Handle folder creation
  const handleCreateFolder = useCallback(async (name: string) => {
    try {
      await createFolder(name, currentPath);
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  }, [createFolder, currentPath]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      await uploadFiles(files, currentPath);
      await fetchDocuments();
      setShowUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadFiles, currentPath, fetchDocuments]);

  // Handle item selection
  const handleItemSelect = (id: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setSelectedItems([id]);
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, documentId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      documentId
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get file icon based on MIME type using our FileIcon component
  const getFileIcon = (mimeType?: string) => {
    return <FileIcon mimeType={mimeType} size="lg" withBackground />;
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div 
      className={`documents-container ${isDark ? 'dark' : ''} ${className} ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop files to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Release to upload to {currentPath || 'root folder'}
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="documents-header border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documents
          </h1>
          
          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <button
            onClick={() => navigateToFolder('')}
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          
          {breadcrumbs.map((crumb, index) => {
            const path = breadcrumbs.slice(0, index + 1).join('/') + '/';
            return (
              <React.Fragment key={path}>
                <ChevronRight className="w-4 h-4" />
                <button
                  onClick={() => navigateToFolder(path)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {crumb}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <NavIcon type="plus" />
              New Folder
            </button>
            
            <button
              onClick={() => setShowUpload(true)}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isUploading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isUploading ? (
                <>
                  <StatusIcon status="uploading" className="text-white" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
            
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Current Folder Actions */}
        {currentPath && (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => handleToggleFavorite(currentPath, breadcrumbs[breadcrumbs.length - 1] || 'Root')}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                isFavorite(currentPath)
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite(currentPath) ? 'fill-current' : ''}`} />
              {isFavorite(currentPath) ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Documents Grid/List */}
      {!loading && !error && (
        <div className={`documents-content ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
            : 'space-y-2'
        }`}>
          {documents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Folder className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No documents found' : 'This folder is empty'}
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                onContextMenu={(e) => handleContextMenu(e, doc.id)}
                onClick={() => doc.type === 'folder' ? navigateToFolder(doc.path) : null}
                className={`document-item group cursor-pointer transition-all duration-200 ${
                  selectedItems.includes(doc.id) ? 'ring-2 ring-blue-500' : ''
                } ${
                  viewMode === 'grid'
                    ? 'p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    : 'flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3">
                        {doc.type === 'folder' ? (
                          <FolderIcon size="xl" isFavorite={doc.is_favorite} />
                        ) : (
                          getFileIcon(doc.mime_type)
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate w-full" title={doc.name}>
                        {doc.name}
                      </h3>
                      
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {doc.type === 'file' && (
                          <span>{formatFileSize(doc.size_bytes)}</span>
                        )}
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(doc.created_at)}
                      </div>

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{doc.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex-shrink-0">
                      {doc.type === 'folder' ? (
                        <FolderIcon size="md" isFavorite={doc.is_favorite} />
                      ) : (
                        <FileIcon mimeType={doc.mime_type} size="md" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.type === 'file' && (
                          <span>{formatFileSize(doc.size_bytes)}</span>
                        )}
                        {doc.uploader_name && (
                          <span>by {doc.uploader_name}</span>
                        )}
                      </div>
                    </div>

                    {/* List Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.is_favorite && (
                        <ActionIcon action="favorite" isActive={true} />
                      )}
                      {doc.is_shared && (
                        <ActionIcon action="share" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, doc.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleDocumentAction('preview', contextMenu.documentId)}
          >
            <ActionIcon action="preview" />
            Preview
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleDocumentAction('download', contextMenu.documentId)}
          >
            <ActionIcon action="download" />
            Download
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleDocumentAction('favorite', contextMenu.documentId)}
          >
            <ActionIcon action="favorite" />
            {documents.find(d => d.id === contextMenu.documentId)?.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleDocumentAction('edit', contextMenu.documentId)}
          >
            <ActionIcon action="edit" />
            Rename
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleDocumentAction('share', contextMenu.documentId)}
          >
            <ActionIcon action="share" />
            Share
          </button>
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <button 
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            onClick={() => handleDocumentAction('delete', contextMenu.documentId)}
          >
            <ActionIcon action="delete" />
            Delete
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Uploading Files ({uploads.filter(u => u.status === 'completed').length}/{uploads.length})
            </h4>
            <button
              onClick={clearUploads}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            {uploads.slice(0, 3).map((upload) => (
              <div key={upload.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {upload.file.name}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        upload.status === 'completed' ? 'bg-green-500' :
                        upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  {upload.error && (
                    <div className="text-xs text-red-500 mt-1">{upload.error}</div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <StatusIcon status={upload.status} />
                  {upload.status === 'uploading' && (
                    <button
                      onClick={() => cancelUpload(upload.id)}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {uploads.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{uploads.length - 3} more files
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to toggle favorite (moved outside of component for clarity)
  function handleToggleFavorite(folderPath: string, folderName: string) {
    if (isFavorite(folderPath)) {
      removeFavorite(folderPath);
    } else {
      addFavorite(folderPath, folderName);
    }
  }
}