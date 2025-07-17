// components/documents/index.tsx - Adding FavoritesBar with real data
'use client';

import React, { useState, useEffect } from 'react';

// Import the working components one by one - we'll test each
// import Folder from './Folder';
// import File from './File';
// import UploadZone from './UploadZone';
import Toolbar from './Toolbar';
// import ContextMenu from './ContextMenu';
// import Preview from './Preview';
import FavoritesBar from './FavoritesBar';

export default function Documents({ className = '' }: { className?: string }) {
  const [documents, setDocuments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📁 Fetching documents and favorites...');
        
        // Fetch documents
        const documentsResponse = await fetch('/api/documents');
        if (!documentsResponse.ok) {
          throw new Error(`Documents API: ${documentsResponse.status}`);
        }
        const documentsData = await documentsResponse.json();
        console.log('📁 Documents data:', documentsData);
        setDocuments(documentsData);

        // Fetch favorites
        const favoritesResponse = await fetch('/api/documents/favorites');
        if (!favoritesResponse.ok) {
          throw new Error(`Favorites API: ${favoritesResponse.status}`);
        }
        const favoritesData = await favoritesResponse.json();
        console.log('⭐ Favorites data:', favoritesData);
        setFavorites(favoritesData);
        
      } catch (err) {
        console.error('📁 Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('🔍 Search:', query);
  };

  // Handle toolbar actions
  const handleCreateFolder = () => {
    console.log('📁 Create folder clicked');
  };

  const handleUpload = () => {
    console.log('📤 Upload clicked');
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh clicked');
    window.location.reload();
  };

  // Handle favorites
  const handleNavigate = (path: string) => {
    console.log('🧭 Navigate to:', path);
  };

  const handleAddFavorite = async (path: string, name: string) => {
    console.log('⭐ Add favorite:', path, name);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    console.log('⭐ Remove favorite:', favoriteId);
  };

  // Convert favorites to the format expected by FavoritesBar
  const favoriteItems = favorites.map((fav: any) => ({
    id: fav.id,
    name: fav.folder_name,
    path: fav.folder_path,
    type: 'folder' as const,
    isPinned: false,
    created_at: fav.created_at
  }));

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
    <div className={`documents-container p-8 ${className}`}>
      <h1 className="text-2xl font-bold mb-6">Documents</h1>
      
      {/* Step 2: Test FavoritesBar Component with real data */}
      <FavoritesBar
        favorites={favoriteItems}
        currentPath=""
        onNavigate={handleNavigate}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
        className="mb-6"
      />
      
      {/* Step 1: Toolbar Component - ✅ Working */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        onRefresh={handleRefresh}
        sortBy="name"
        sortOrder="asc"
        onSortChange={(sortBy, sortOrder) => console.log('Sort:', sortBy, sortOrder)}
        showFavoritesOnly={false}
        onToggleFavorites={() => console.log('Toggle favorites')}
        selectedCount={0}
        onClearSelection={() => console.log('Clear selection')}
        onSelectAll={() => console.log('Select all')}
        isUploading={false}
        isLoading={loading}
        className="mb-6"
      />
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">
          Found {documents.length} documents
        </h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500">This folder is empty. Upload some files to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center p-3 border border-gray-100 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-gray-500">
                    {doc.type} • Created {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>✅ API connection working</p>
        <p>✅ Toolbar component working</p>
        <p>✅ FavoritesBar with real data</p>
        <p>📊 {favorites.length} favorites loaded</p>
      </div>
    </div>
  );
}