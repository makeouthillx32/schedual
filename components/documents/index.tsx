// components/documents/index.tsx - CLEAN VERSION
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  useDocuments, 
  useFileUpload, 
  useFolderFavorites 
} from '@/hooks/useDocuments';

// Import individual components
import Folder from './Folder';
import File from './File';
import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Preview from './Preview';
import FavoritesBar from './FavoritesBar';

// Only use Lucide icons - no custom icon conflicts
import { 
  Folder as FolderLucide,
  File as FileLucide,
  Upload,
  MoreVertical
} from 'lucide-react';

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Loading documents...</p>
      </div>
    );
  }

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

      {/* Documents Grid/List */}
      <div className={`documents-content ${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
          : 'space-y-2'
      }`}>
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderLucide className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchQuery ? 'No documents found' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            doc.type === 'folder' ? (
              <Folder
                key={doc.id}
                folder={doc}
                viewMode={viewMode}
                isSelected={selectedItems.includes(doc.id)}
                isFavorite={doc.is_favorite}
                onNavigate={navigateToFolder}
                onToggleFavorite={(path, name) => addFavorite(path, name)}
                onContextMenu={handleContextMenu}
                onSelect={(id, isMulti) => {
                  if (isMulti) {
                    setSelectedItems(prev => 
                      prev.includes(id) 
                        ? prev.filter(item => item !== id)
                        : [...prev, id]
                    );
                  } else {
                    setSelectedItems([id]);
                  }
                }}
              />
            ) : (
              <File
                key={doc.id}
                file={doc}
                viewMode={viewMode}
                isSelected={selectedItems.includes(doc.id)}
                isFavorite={doc.is_favorite}
                onPreview={() => setPreviewDocument(doc.id)}
                onDownload={() => handleDocumentAction('download', doc.id)}
                onToggleFavorite={() => handleDocumentAction('favorite', doc.id)}
                onContextMenu={handleContextMenu}
                onSelect={(id, isMulti) => {
                  if (isMulti) {
                    setSelectedItems(prev => 
                      prev.includes(id) 
                        ? prev.filter(item => item !== id)
                        : [...prev, id]
                    );
                  } else {
                    setSelectedItems([id]);
                  }
                }}
              />
            )
          ))
        )}
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

      {/* Simple upload zone instead of complex UploadZone component */}
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