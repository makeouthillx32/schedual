// hooks/usePublicFolders.ts - FIXED CLIENT-SIDE VERSION
import { useState, useCallback, useEffect } from 'react';
import { useDocuments } from './useDocuments';

interface PublicFolder {
  id: string;
  name: string;
  path: string;
  public_slug: string;
  is_public_folder: boolean;
  created_at: string;
  file_count: number;
  public_url: string;
}

interface PublicFolderHook {
  publicFolders: PublicFolder[];
  makefolderPublic: (folderId: string, slug?: string) => Promise<void>;
  makeFolderPrivate: (folderId: string) => Promise<void>;
  generateFolderSlug: (folderName: string) => string;
  getPublicAssetUrl: (folderSlug: string, fileName: string) => string;
  copyFolderUrl: (folderSlug: string) => void;
  generateUsageExample: (folderSlug: string, fileName?: string) => string;
  loading: boolean;
  error: string | null;
}

export function usePublicFolders(): PublicFolderHook {
  const { documents, updateDocument, fetchDocuments } = useDocuments();
  const [publicFolders, setPublicFolders] = useState<PublicFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and transform folders into public folders
  useEffect(() => {
    const folders = documents
      .filter(doc => doc.type === 'folder' && doc.is_public_folder)
      .map(folder => ({
        id: folder.id,
        name: folder.name,
        path: folder.path,
        public_slug: folder.public_slug || generateFolderSlug(folder.name),
        is_public_folder: folder.is_public_folder || false,
        created_at: folder.created_at,
        file_count: documents.filter(f => f.path.startsWith(folder.path) && f.type === 'file').length,
        public_url: getPublicAssetUrl(folder.public_slug || generateFolderSlug(folder.name), '')
      }));
    
    setPublicFolders(folders);
  }, [documents]);

  // Generate URL-friendly slug from folder name
  const generateFolderSlug = useCallback((folderName: string): string => {
    return folderName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }, []);

  // Make folder public with optional custom slug
  const makefolderPublic = useCallback(async (folderId: string, customSlug?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const folder = documents.find(d => d.id === folderId);
      if (!folder) throw new Error('Folder not found');

      const slug = customSlug || generateFolderSlug(folder.name);
      
      // Check if slug already exists
      const slugExists = publicFolders.some(f => f.public_slug === slug && f.id !== folderId);
      if (slugExists) {
        throw new Error('Slug already exists. Please choose a different one.');
      }

      // Call API to make folder public
      const response = await fetch('/api/documents/make-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId,
          publicSlug: slug
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to make folder public');
      }

      // Refresh documents to get updated data
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make folder public');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [documents, publicFolders, fetchDocuments, generateFolderSlug]);

  // Make folder private
  const makeFolderPrivate = useCallback(async (folderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call API to make folder private
      const response = await fetch('/api/documents/make-private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to make folder private');
      }

      // Refresh documents to get updated data
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make folder private');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  // Get public asset URL
  const getPublicAssetUrl = useCallback((folderSlug: string, fileName: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return fileName 
      ? `${baseUrl}/api/public/assets/${folderSlug}/${fileName}`
      : `${baseUrl}/api/public/assets/${folderSlug}/`;
  }, []);

  // Copy folder URL to clipboard
  const copyFolderUrl = useCallback((folderSlug: string) => {
    const url = getPublicAssetUrl(folderSlug, '');
    navigator.clipboard.writeText(url).then(() => {
      console.log('Folder URL copied to clipboard');
      // You can add a toast notification here
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  }, [getPublicAssetUrl]);

  // Generate usage example code
  const generateUsageExample = useCallback((folderSlug: string, fileName?: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    if (fileName) {
      // Specific file example
      const url = `${baseUrl}/api/public/assets/${folderSlug}/${fileName}`;
      return `// Next.js Image Component
<Image
  src="${url}"
  alt="Company asset"
  width={400}
  height={300}
  className="rounded-lg"
/>

// Regular HTML img tag
<img 
  src="${url}" 
  alt="Company asset"
  className="rounded-lg w-full h-auto"
/>

// CSS background image
background-image: url('${url}');`;
    } else {
      // Folder access example
      return `// Access any image in the ${folderSlug} folder:
const imageUrl = "${baseUrl}/api/public/assets/${folderSlug}/your-image.jpg"

// Example usage:
<Image
  src="${baseUrl}/api/public/assets/${folderSlug}/logo.png"
  alt="Company logo"
  width={200}
  height={100}
/>`;
    }
  }, []);

  return {
    publicFolders,
    makefolderPublic,
    makeFolderPrivate,
    generateFolderSlug,
    getPublicAssetUrl,
    copyFolderUrl,
    generateUsageExample,
    loading,
    error
  };
}