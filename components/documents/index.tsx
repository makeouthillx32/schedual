// components/documents/index.tsx - Adding FavoritesBar
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        console.log('📁 Fetching documents...');
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📁 Documents data:', data);
        setDocuments(data);
      } catch (err) {
        console.error('📁 Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  // Mock favorites data
  const favoriteItems = [
    {
      id: 'fav1',
      name: 'Financial Documents',
      path: '/financial',
      type: 'folder' as const,
      isPinned: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'fav2', 
      name: 'Project Files',
      path: '/projects',
      type: 'folder' as const,
      isPinned: false,
      created_at: new Date().toISOString()
    }
  ];

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
      
      {/* Step 2: Test FavoritesBar Component */}
      <FavoritesBar
        favorites={favoriteItems}
        currentPath=""
        onNavigate={handleNavigate}
        onAddFavorite={(path, name) => console.log('Add favorite:', path, name)}
        onRemoveFavorite={(favoriteId) => console.log('Remove favorite:', favoriteId)}
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
        <p>🧪 Testing FavoritesBar component...</p>
      </div>
    </div>
  );
}