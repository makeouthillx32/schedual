// components/documents/index.tsx - REFACTORED VERSION
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  useDocuments, 
  useFileUpload, 
  useFolderFavorites 
} from '@/hooks/useDocuments';

// Import individual components
import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Preview from './Preview';
import FavoritesBar from './FavoritesBar';
import Breadcrumb from './Breadcrumb';
import FileGrid from './FileGrid';

interface DocumentsProps {
  className?: string;
}

export default function Documents({ className = '' }: DocumentsProps) {
  // Basic state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    documentId: string;
  } | null>(null);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Hooks
  const {
    documents,
    loading,
    error,
    currentPath,
    navigateToFolder,
    createFolder,
    updateDocument,
    deleteDocument,
    searchDocuments,
    fetchDocuments
  } = useDocuments();

  const { uploadFiles, isUploading, uploads } = useFileUpload();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFolderFavorites();

  // Handlers
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchDocuments(query, currentPath);
    } else {
      await fetchDocuments();
    }
  }, [searchDocuments, fetchDocuments, currentPath]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      await uploadFiles(files, currentPath);
      await fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadFiles, currentPath, fetchDocuments]);

  const handleDocumentAction = useCallback(async (action: string, documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    try {
      switch (action) {
        case 'preview':
          setPreviewDocument(documentId);
          break;
        case 'download':
          window.open(`/api/documents/${documentId}/download`, '_blank');
          break;
        case 'favorite':
          await updateDocument(documentId, { is_favorite: !document.is_favorite });
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
            await deleteDocument(documentId);
          }
          break;
        case 'edit':
          const newName = prompt('Enter new name:', document.name);
          if (newName && newName !== document.name) {
            await updateDocument(documentId, { name: newName });
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} document:`, error);
    }
    
    setContextMenu(null);
  }, [documents, updateDocument, deleteDocument]);

  const handleContextMenu = useCallback((e: React.MouseEvent, documentId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      documentId
    });
  }, []);

  const handleSelect = useCallback((id: string, isMulti: boolean) => {
    if (isMulti) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setSelectedItems([id]);
    }
  }, []);

  // Convert favorites for FavoritesBar
  const favoriteItems = favorites.map(fav => ({
    id: fav.id,
    name: fav.folder_name,
    path: fav.folder_path,
    type: 'folder' as const,
    isPinned: false,
    created_at: fav.created_at
  }));

  // Get preview document
  const previewDoc = previewDocument ? documents.find(d => d.id === previewDocument) : undefined;

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Loading documents...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading documents</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`documents-container space-y-6 ${className}`}>
      {/* Favorites Bar */}
      <FavoritesBar
        favorites={favoriteItems}
        currentPath={currentPath}
        onNavigate={navigateToFolder}
        onAddFavorite={(path, name) => addFavorite(path, name)}
        onRemoveFavorite={(favoriteId) => {
          const favorite = favorites.find(f => f.id === favoriteId);
          if (favorite) removeFavorite(favorite.folder_path);
        }}
      />

      {/* Toolbar */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUpload={() => setShowUploadZone(true)}
        onCreateFolder={async () => {
          const name = prompt('Enter folder name:');
          if (name) {
            await createFolder(name, currentPath);
          }
        }}
        onRefresh={fetchDocuments}
        sortBy="name"
        sortOrder="asc"
        onSortChange={() => {}}
        showFavoritesOnly={false}
        onToggleFavorites={() => {}}
        selectedCount={selectedItems.length}
        onClearSelection={() => setSelectedItems([])}
        onSelectAll={() => setSelectedItems(documents.map(d => d.id))}
        isUploading={isUploading}
        isLoading={loading}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        currentPath={currentPath}
        onNavigate={navigateToFolder}
      />

      {/* Documents Content Area */}
      <div className="space-y-4">
        {/* Quick Back Button */}
        {currentPath && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const pathParts = currentPath.split('/').filter(Boolean);
                const parentPath = pathParts.length > 1 
                  ? pathParts.slice(0, -1).join('/') + '/'
                  : '';
                navigateToFolder(parentPath);
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {currentPath.split('/').filter(Boolean).length > 1 
                ? currentPath.split('/').filter(Boolean).slice(-2, -1)[0] 
                : 'Home'}
            </button>
            
            <div className="text-sm text-gray-500">
              {documents.length} item{documents.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* File Grid - Isolated Rendering Component */}
        <FileGrid
          documents={documents}
          viewMode={viewMode}
          selectedItems={selectedItems}
          searchQuery={searchQuery}
          currentPath={currentPath}
          onPreview={(id) => setPreviewDocument(id)}
          onDownload={(id) => handleDocumentAction('download', id)}
          onToggleFavorite={(id) => handleDocumentAction('favorite', id)}
          onNavigate={navigateToFolder}
          onAddFavorite={addFavorite}
          onContextMenu={handleContextMenu}
          onSelect={handleSelect}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          isOpen={true}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          document={documents.find(d => d.id === contextMenu.documentId)}
          onClose={() => setContextMenu(null)}
          onAction={handleDocumentAction}
        />
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <Preview
          isOpen={true}
          document={previewDoc}
          documents={documents}
          onClose={() => setPreviewDocument(null)}
          onDownload={(docId) => handleDocumentAction('download', docId)}
          onDelete={(docId) => handleDocumentAction('delete', docId)}
          onNext={(docId) => setPreviewDocument(docId)}
          onPrevious={(docId) => setPreviewDocument(docId)}
        />
      )}

      {/* Simple upload zone */}
      {showUploadZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Upload Files</h3>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleFileUpload(files);
                  setShowUploadZone(false);
                }
              }}
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowUploadZone(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}