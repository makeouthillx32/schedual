// hooks/usePublicFolders.ts
import { useState, useCallback, useEffect } from 'react';
import { useDocuments } from './useDocuments';

interface PublicFolder {
  id: string;
  folder_path: string;
  folder_name: string;
  url_slug?: string;
  description?: string;
  is_public: boolean;
  created_at: string;
}

interface PublicFolderHook {
  publicFolders: PublicFolder[];
  makefolderPublic: (folderPath: string, options?: PublicFolderOptions) => Promise<void>;
  makeFolderPrivate: (folderPath: string) => Promise<void>;
  updateFolderSlug: (folderPath: string, newSlug: string) => Promise<void>;
  getPublicUrl: (assetPath: string) => string;
  copyFolderUrl: (folderPath: string) => void;
  generateAssetLinks: (folderPath: string) => Promise<AssetLink[]>;
  loading: boolean;
  error: string | null;
}

interface PublicFolderOptions {
  urlSlug?: string;
  description?: string;
}

interface AssetLink {
  filename: string;
  path: string;
  publicUrl: string;
  copyCode: string;
}

export function usePublicFolders(): PublicFolderHook {
  const [publicFolders, setPublicFolders] = useState<PublicFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchDocuments, updateDocument } = useDocuments();

  // Fetch public folders
  const fetchPublicFolders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public-folders');
      if (!response.ok) throw new Error('Failed to fetch public folders');
      
      const folders = await response.json();
      setPublicFolders(folders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch public folders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Make folder public
  const makefolderPublic = useCallback(async (
    folderPath: string, 
    options: PublicFolderOptions = {}
  ) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/public-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath,
          urlSlug: options.urlSlug,
          description: options.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to make folder public');
      }

      // Refresh the list
      await fetchPublicFolders();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make folder public');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPublicFolders]);

  // Make folder private
  const makeFolderPrivate = useCallback(async (folderPath: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/public-folders/${encodeURIComponent(folderPath)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to make folder private');
      }

      await fetchPublicFolders();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make folder private');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPublicFolders]);

  // Update folder URL slug
  const updateFolderSlug = useCallback(async (folderPath: string, newSlug: string) => {
    try {
      const response = await fetch(`/api/public-folders/${encodeURIComponent(folderPath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlSlug: newSlug })
      });

      if (!response.ok) {
        throw new Error('Failed to update folder slug');
      }

      await fetchPublicFolders();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder slug');
      throw err;
    }
  }, [fetchPublicFolders]);

  // Get public URL for an asset
  const getPublicUrl = useCallback((assetPath: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Check if the asset is in a public folder with a custom slug
    const publicFolder = publicFolders.find(folder => 
      assetPath.startsWith(folder.folder_path)
    );

    if (publicFolder?.url_slug) {
      const relativePath = assetPath.replace(publicFolder.folder_path, '');
      return `${baseUrl}/api/assets/${publicFolder.url_slug}/${relativePath}`;
    }

    return `${baseUrl}/api/public/assets/${assetPath}`;
  }, [publicFolders]);

  // Copy folder URL to clipboard
  const copyFolderUrl = useCallback((folderPath: string) => {
    const publicFolder = publicFolders.find(folder => folder.folder_path === folderPath);
    if (!publicFolder) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const folderUrl = publicFolder.url_slug 
      ? `${baseUrl}/api/assets/${publicFolder.url_slug}/`
      : `${baseUrl}/api/public/assets/${folderPath}`;
    
    navigator.clipboard.writeText(folderUrl).then(() => {
      console.log('Folder URL copied to clipboard');
    });
  }, [publicFolders]);

  // Generate asset links for all files in a folder
  const generateAssetLinks = useCallback(async (folderPath: string): Promise<AssetLink[]> => {
    try {
      const response = await fetch(`/api/documents?folder=${encodeURIComponent(folderPath)}`);
      if (!response.ok) throw new Error('Failed to fetch folder contents');
      
      const documents = await response.json();
      const imageFiles = documents.filter((doc: any) => 
        doc.type === 'file' && 
        doc.mime_type?.startsWith('image/')
      );

      return imageFiles.map((file: any) => {
        const publicUrl = getPublicUrl(file.path);
        const copyCode = `<Image
  src="${publicUrl}"
  alt="${file.name}"
  width={800}
  height={600}
  className="object-cover rounded-lg"
/>`;

        return {
          filename: file.name,
          path: file.path,
          publicUrl,
          copyCode
        };
      });
      
    } catch (err) {
      throw new Error('Failed to generate asset links');
    }
  }, [getPublicUrl]);

  // Load public folders on mount
  useEffect(() => {
    fetchPublicFolders();
  }, [fetchPublicFolders]);

  return {
    publicFolders,
    makefolderPublic,
    makeFolderPrivate,
    updateFolderSlug,
    getPublicUrl,
    copyFolderUrl,
    generateAssetLinks,
    loading,
    error
  };
}

// API Route: app/api/public-folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get all folders marked as public
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('type', 'folder')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching public folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { folderPath, urlSlug, description } = await request.json();
    const supabase = await createClient();

    // Update the folder to be public
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        is_public: true,
        public_url_slug: urlSlug
      })
      .eq('path', folderPath)
      .eq('type', 'folder');

    if (updateError) throw updateError;

    // Also mark all files in the folder as public
    const { error: filesError } = await supabase
      .from('documents')
      .update({ is_public: true })
      .like('path', `${folderPath}%`)
      .eq('type', 'file');

    if (filesError) {
      console.warn('Some files could not be made public:', filesError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error making folder public:', error);
    return NextResponse.json(
      { error: 'Failed to make folder public' },
      { status: 500 }
    );
  }
}

// API Route: app/api/public-folders/[folderPath]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { folderPath: string } }
) {
  try {
    const folderPath = decodeURIComponent(params.folderPath);
    const supabase = await createClient();

    // Make folder private
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        is_public: false,
        public_url_slug: null
      })
      .eq('path', folderPath)
      .eq('type', 'folder');

    if (updateError) throw updateError;

    // Also make all files in the folder private
    const { error: filesError } = await supabase
      .from('documents')
      .update({ is_public: false })
      .like('path', `${folderPath}%`)
      .eq('type', 'file');

    if (filesError) {
      console.warn('Some files could not be made private:', filesError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error making folder private:', error);
    return NextResponse.json(
      { error: 'Failed to make folder private' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { folderPath: string } }
) {
  try {
    const folderPath = decodeURIComponent(params.folderPath);
    const { urlSlug } = await request.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from('documents')
      .update({ public_url_slug: urlSlug })
      .eq('path', folderPath)
      .eq('type', 'folder');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating folder slug:', error);
    return NextResponse.json(
      { error: 'Failed to update folder slug' },
      { status: 500 }
    );
  }
}