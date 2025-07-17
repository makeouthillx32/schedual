// hooks/useDocuments.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// ============================================================================
// INTERFACES
// ============================================================================

export interface DocumentItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  mime_type?: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_shared: boolean;
  tags: string[];
  uploader_name?: string;
  uploader_email?: string;
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  user_id: string;
  activity_type: string;
  details?: any;
  created_at: string;
  user?: {
    email: string;
    raw_user_meta_data?: any;
  };
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: any;
}

interface FolderFavorite {
  id: string;
  user_id: string;
  folder_path: string;
  folder_name: string;
  created_at: string;
}

interface ShareDocument {
  documentId: string;
  sharedWithUserId?: string;
  sharedWithRole?: string;
  permissionLevel: 'read' | 'write' | 'admin';
  expiresAt?: string;
}

// ============================================================================
// MAIN DOCUMENTS HOOK
// ============================================================================

export function useDocuments(initialFolderPath: string = '') {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(initialFolderPath);

  // Fetch documents for current folder
  const fetchDocuments = useCallback(async (folderPath: string = currentPath) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (folderPath) params.append('folder', folderPath);

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  // Search documents
  const searchDocuments = useCallback(async (query: string, folderPath?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ search: query });
      if (folderPath) params.append('folder', folderPath);

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigate to folder
  const navigateToFolder = useCallback((path: string) => {
    setCurrentPath(path);
    fetchDocuments(path);
  }, [fetchDocuments]);

  // Create folder
  const createFolder = useCallback(async (name: string, parentPath?: string) => {
    try {
      const folderPath = parentPath ? `${parentPath}${name}/` : `${name}/`;
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'folder',
          name,
          path: folderPath,
          parentPath: parentPath || null
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`);
      }

      const newFolder = await response.json();
      toast.success(`Folder "${name}" created successfully`);
      
      // Refresh current view
      await fetchDocuments();
      
      return newFolder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchDocuments]);

  // Update document
  const updateDocument = useCallback(async (
    documentId: string, 
    updates: Partial<Pick<DocumentItem, 'name' | 'tags' | 'is_favorite'>>
  ) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update document: ${response.statusText}`);
      }

      const updatedDocument = await response.json();
      
      // Update local state
      setDocuments(prev => 
        prev.map(doc => doc.id === documentId ? { ...doc, ...updatedDocument } : doc)
      );
      
      toast.success('Document updated successfully');
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast.success(result.message || 'Document deleted successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Move document
  const moveDocument = useCallback(async (documentId: string, newPath: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPath })
      });

      if (!response.ok) {
        throw new Error(`Failed to move document: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success(result.message || 'Document moved successfully');
      
      // Refresh current view
      await fetchDocuments();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move document';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchDocuments]);

  // Initial load
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    currentPath,
    fetchDocuments,
    searchDocuments,
    navigateToFolder,
    createFolder,
    updateDocument,
    deleteDocument,
    moveDocument
  };
}

// ============================================================================
// FILE UPLOAD HOOK
// ============================================================================

export function useFileUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (
    files: File[], 
    folderPath: string = '',
    options?: {
      description?: string;
      tags?: string[];
      onProgress?: (fileId: string, progress: number) => void;
    }
  ) => {
    setIsUploading(true);
    const uploadMap = new Map<string, UploadProgress>();

    // Initialize upload tracking
    files.forEach(file => {
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`;
      uploadMap.set(fileId, {
        file,
        progress: 0,
        status: 'pending'
      });
    });

    setUploads(uploadMap);

    const results = [];

    try {
      for (const [fileId, uploadInfo] of uploadMap.entries()) {
        try {
          // Update status to uploading
          uploadMap.set(fileId, { ...uploadInfo, status: 'uploading' });
          setUploads(new Map(uploadMap));

          const formData = new FormData();
          formData.append('file', uploadInfo.file);
          formData.append('folderPath', folderPath);
          
          if (options?.description) {
            formData.append('description', options.description);
          }
          
          if (options?.tags) {
            formData.append('tags', JSON.stringify(options.tags));
          }

          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          // Update to completed
          uploadMap.set(fileId, {
            ...uploadInfo,
            progress: 100,
            status: 'completed',
            result
          });
          
          results.push(result);
          toast.success(`${uploadInfo.file.name} uploaded successfully`);

          // Call progress callback
          options?.onProgress?.(fileId, 100);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          uploadMap.set(fileId, {
            ...uploadInfo,
            status: 'error',
            error: errorMessage
          });
          
          toast.error(`${uploadInfo.file.name}: ${errorMessage}`);
        }

        setUploads(new Map(uploadMap));
      }

      return results;
    } finally {
      setIsUploading(false);
      
      // Clear uploads after a delay
      setTimeout(() => {
        setUploads(new Map());
      }, 3000);
    }
  }, []);

  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  const cancelUpload = useCallback((fileId: string) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      const upload = newMap.get(fileId);
      if (upload && upload.status === 'uploading') {
        newMap.set(fileId, { ...upload, status: 'error', error: 'Cancelled by user' });
      }
      return newMap;
    });
  }, []);

  return {
    uploads: Array.from(uploads.entries()).map(([id, upload]) => ({ id, ...upload })),
    isUploading,
    uploadFiles,
    clearUploads,
    cancelUpload
  };
}

// ============================================================================
// FOLDER FAVORITES HOOK
// ============================================================================

export function useFolderFavorites() {
  const [favorites, setFavorites] = useState<FolderFavorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (folderPath: string, folderName: string) => {
    try {
      const response = await fetch('/api/documents/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath, folderName })
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      const newFavorite = await response.json();
      setFavorites(prev => [newFavorite, ...prev]);
      toast.success('Added to favorites');
      
      return newFavorite;
    } catch (error) {
      toast.error('Failed to add favorite');
      throw error;
    }
  }, []);

  const removeFavorite = useCallback(async (folderPath: string) => {
    try {
      const response = await fetch(`/api/documents/favorites?folderPath=${encodeURIComponent(folderPath)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      setFavorites(prev => prev.filter(fav => fav.folder_path !== folderPath));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
      throw error;
    }
  }, []);

  const isFavorite = useCallback((folderPath: string) => {
    return favorites.some(fav => fav.folder_path === folderPath);
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
}

// ============================================================================
// DOCUMENT ACTIVITY HOOK
// ============================================================================

export function useDocumentActivity(documentId: string) {
  const [activity, setActivity] = useState<DocumentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async (limit: number = 20) => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/activity/${documentId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }

      const data = await response.json();
      setActivity(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activity,
    loading,
    error,
    refetch: fetchActivity
  };
}

// ============================================================================
// DOCUMENT SHARING HOOK
// ============================================================================

export function useDocumentSharing() {
  const [sharing, setSharing] = useState(false);

  const shareDocument = useCallback(async (shareData: ShareDocument) => {
    setSharing(true);
    try {
      const response = await fetch('/api/documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData)
      });

      if (!response.ok) {
        throw new Error('Failed to share document');
      }

      const result = await response.json();
      toast.success('Document shared successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to share document');
      throw error;
    } finally {
      setSharing(false);
    }
  }, []);

  return {
    shareDocument,
    sharing
  };
}