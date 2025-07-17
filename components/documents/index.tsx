// components/documents/index.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  useDocuments, 
  useFileUpload, 
  useFolderFavorites 
} from '@/hooks/useDocuments';
import { 
  DocumentSkeleton, 
  HeaderSkeleton, 
  UploadSkeleton,
  SearchSkeleton
} from './skeleton';
import { 
  FileIcon, 
  FolderIcon, 
  StatusIcon, 
  ActionIcon, 
  NavIcon
} from './icons';

// Import all sub-components
import Folder from './Folder';
import File from './File';
import UploadZone from './UploadZone';
import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Preview from './Preview';
import FavoritesBar from './FavoritesBar';

// Icons from lucide-react
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  Star, 
  Upload,
  Folder as FolderLucide,
  File as FileLucide,
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
} from 'lucide-react';

// Mock theme context - replace with your actual theme hook
const useTheme = () => ({ isDark: false });

interface DocumentsProps {
  className?: string;
}

export default function Documents({ className = '' }: DocumentsProps) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    documentId: string;
  } | null>(null);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

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

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchDocuments(query, currentPath);
    } else {
      await fetchDocuments();
    }
  }, [searchDocuments, fetchDocuments, currentPath]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      await uploadFiles(files, currentPath);
      await fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadFiles, currentPath, fetchDocuments]);

  // Handle document actions
  const handleDocumentAction = useCallback(async (action: string, documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    try {
      switch (action) {
        case 'preview':
          setPreviewDocument(documentId);
          break;
        case 'download':
          // Implement download logic
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
        case 'share':
          // Implement share logic
          console.log('Share document:', documentId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} document:`, error);
    }
    
    setContextMenu(null);
  }, [documents, updateDocument, deleteDocument]);

  // Handle folder favorite toggle
  const handleToggleFavorite = useCallback(async (folderPath: string, folderName: string) => {
    try {
      if (isFavorite(folderPath)) {
        await removeFavorite(folderPath);
      } else {
        await addFavorite(folderPath, folderName);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  // Handle item selection
  const handleItemSelect = useCallback((id: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setSelectedItems([id]);
    }
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, documentId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      documentId
    });
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Generate breadcrumb from current path
  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Convert favorites to the format expected by FavoritesBar
  const favoriteItems = favorites.map(fav => ({
    id: fav.id,
    name: fav.folder_name,
    path: fav.folder_path,
    type: 'folder' as const,
    isPinned: false, // Add pinning logic if needed
    created_at: fav.created_at
  }));

  // Get the document for preview
  const previewDoc = previewDocument ? documents.find(d => d.id === previewDocument) : undefined;

  return (
    <div 
      className={`documents-container ${isDark ? 'dark' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        className="mb-6"
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
        onSortChange={(sortBy, sortOrder) => {
          // Implement sorting logic
          console.log('Sort by:', sortBy, sortOrder);
        }}
        showFavoritesOnly={false}
        onToggleFavorites={() => {
          // Implement favorites filter
          console.log('Toggle favorites filter');
        }}
        selectedCount={selectedItems.length}
        onClearSelection={() => setSelectedItems([])}
        onSelectAll={() => setSelectedItems(documents.map(d => d.id))}
        isUploading={isUploading}
        isLoading={loading}
        className="mb-6"
      />

      {/* Upload Zone */}
      {showUploadZone && (
        <UploadZone
          isOpen={showUploadZone}
          onClose={() => setShowUploadZone(false)}
          onUpload={handleFileUpload}
          currentPath={currentPath}
          isUploading={isUploading}
          uploads={uploads.map(u => ({ ...u, id: u.id }))}
          onCancelUpload={cancelUpload}
          onClearUploads={clearUploads}
          className="mb-6"
        />
      )}

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

      {/* Loading State */}
      {loading && <DocumentSkeleton count={8} viewMode={viewMode} />}

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
              <FolderLucide className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
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
                  onToggleFavorite={handleToggleFavorite}
                  onContextMenu={handleContextMenu}
                  onSelect={handleItemSelect}
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
                  onSelect={handleItemSelect}
                />
              )
            ))
          )}
        </div>
      )}

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
    </div>
  );
}