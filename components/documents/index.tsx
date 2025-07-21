// components/documents/index.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  useDocuments,
  useFileUpload,
  useFolderFavorites,
} from '@/hooks/useDocuments';

import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Preview from './Preview';
import FavoritesBar from './FavoritesBar';
import FileGrid from './FileGrid';

interface DocumentsProps {
  className?: string;
}

const debounce = (fn: Function, delay = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function Documents({ className = '' }: DocumentsProps) {
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

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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
    fetchDocuments,
  } = useDocuments();

  const { uploadFiles, isUploading } = useFileUpload();
  const { favorites, addFavorite, removeFavorite } = useFolderFavorites();

  useEffect(() => {
    if (!loading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [loading, isInitialLoading]);

  const debouncedSearch = useCallback(
    debounce(async (query: string, path: string) => {
      setIsSearching(true);
      try {
        if (query.trim()) {
          await searchDocuments(query, path);
        } else {
          await fetchDocuments();
        }
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchDocuments, fetchDocuments]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      debouncedSearch(query, currentPath);
    },
    [debouncedSearch, currentPath]
  );

  const handleNavigate = useCallback(
    async (path: string) => {
      setIsNavigating(true);
      try {
        await navigateToFolder(path);
      } finally {
        setIsNavigating(false);
      }
    },
    [navigateToFolder]
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      try {
        await uploadFiles(files, currentPath);
        await fetchDocuments();
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [uploadFiles, currentPath, fetchDocuments]
  );

  const handleDocumentAction = useCallback(
    async (action: string, documentId: string) => {
      const document = documents.find((d) => d.id === documentId);
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
            await updateDocument(documentId, {
              is_favorite: !document.is_favorite,
            });
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
    },
    [documents, updateDocument, deleteDocument]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, documentId: string) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        documentId,
      });
    },
    []
  );

  const handleSelect = useCallback((id: string, isMulti: boolean) => {
    setSelectedItems((prev) =>
      isMulti
        ? prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
        : [id]
    );
  }, []);

  const fileGridHandlers = useMemo(
    () => ({
      onPreview: (id: string) => setPreviewDocument(id),
      onDownload: (id: string) => handleDocumentAction('download', id),
      onToggleFavorite: (id: string) => handleDocumentAction('favorite', id),
      onNavigate: handleNavigate,
      onAddFavorite: addFavorite,
      onContextMenu: handleContextMenu,
      onSelect: handleSelect,
    }),
    [handleDocumentAction, handleNavigate, addFavorite, handleContextMenu, handleSelect]
  );

  const favoriteItems = useMemo(
    () =>
      favorites.map((fav) => ({
        id: fav.id,
        name: fav.folder_name,
        path: fav.folder_path,
        type: 'folder' as const,
        isPinned: false,
        created_at: fav.created_at,
      })),
    [favorites]
  );

  const previewDoc = useMemo(
    () => previewDocument && documents.find((d) => d.id === previewDocument),
    [previewDocument, documents]
  );

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isInitialLoading && loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="text-destructive-foreground font-medium">Error loading documents</h3>
          <p className="text-destructive-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex-1 flex flex-col overflow-hidden bg-background text-foreground ${className}`}>
      <div className="sticky top-0 z-10 border-b border-border bg-card">
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
          onSelectAll={() => setSelectedItems(documents.map((d) => d.id))}
          isUploading={isUploading}
          isLoading={isSearching || isNavigating}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="relative">
            {(isSearching || isNavigating) && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>{isSearching ? 'Searching...' : 'Loading...'}</span>
                </div>
              </div>
            )}

            <FileGrid
              documents={documents}
              viewMode={viewMode}
              selectedItems={selectedItems}
              searchQuery={searchQuery}
              currentPath={currentPath}
              {...fileGridHandlers}
            />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border p-6 bg-card">
        <FavoritesBar
          favorites={favoriteItems}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onAddFavorite={(path, name) => addFavorite(path, name)}
          onRemoveFavorite={(favoriteId) => {
            const favorite = favorites.find((f) => f.id === favoriteId);
            if (favorite) removeFavorite(favorite.folder_path);
          }}
        />
      </div>

      {contextMenu && (
        <ContextMenu
          isOpen={true}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          document={documents.find((d) => d.id === contextMenu.documentId)}
          onClose={() => setContextMenu(null)}
          onAction={handleDocumentAction}
        />
      )}

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

      {showUploadZone && (
        <div className="fixed inset-0 bg-muted/70 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 text-foreground border border-border">
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
              className="block w-full border border-border rounded-lg p-2 bg-background text-foreground"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowUploadZone(false)}
                className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}