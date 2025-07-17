// components/Docustore/Preview/index.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentItem } from '@/hooks/useDocuments';

interface PreviewProps {
  isOpen: boolean;
  document?: DocumentItem;
  documents?: DocumentItem[]; // For navigation between files
  onClose: () => void;
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onNext?: (documentId: string) => void;
  onPrevious?: (documentId: string) => void;
  className?: string;
}

export default function Preview({
  isOpen,
  document,
  documents = [],
  onClose,
  onDownload,
  onDelete,
  onNext,
  onPrevious,
  className = ''
}: PreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Get preview URL for document
  const getPreviewUrl = useCallback((doc: DocumentItem) => {
    if (!doc) return '';
    
    // For images, try to get the actual file URL
    if (doc.mime_type?.startsWith('image/')) {
      return `/api/documents/${doc.id}/download`; // You'll need to implement this endpoint
    }
    
    // For PDFs, use PDF.js viewer or similar
    if (doc.mime_type?.includes('pdf')) {
      return `/api/documents/${doc.id}/preview`; // PDF preview endpoint
    }
    
    return '';
  }, []);

  // Check if document can be previewed
  const canPreview = useCallback((doc?: DocumentItem) => {
    if (!doc?.mime_type) return false;
    const mimeType = doc.mime_type.toLowerCase();
    return mimeType.startsWith('image/') || 
           mimeType.includes('pdf') || 
           mimeType.startsWith('text/') ||
           mimeType.includes('json');
  }, []);

  // Get current document index for navigation
  const getCurrentIndex = useCallback(() => {
    if (!document || !documents.length) return -1;
    return documents.findIndex(doc => doc.id === document.id);
  }, [document, documents]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;
    
    // Find next previewable document
    for (let i = currentIndex + 1; i < documents.length; i++) {
      if (canPreview(documents[i])) {
        onNext?.(documents[i].id);
        return;
      }
    }
    
    // Wrap around to beginning
    for (let i = 0; i < currentIndex; i++) {
      if (canPreview(documents[i])) {
        onNext?.(documents[i].id);
        return;
      }
    }
  }, [getCurrentIndex, documents, canPreview, onNext]);

  const handlePrevious = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;
    
    // Find previous previewable document
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (canPreview(documents[i])) {
        onPrevious?.(documents[i].id);
        return;
      }
    }
    
    // Wrap around to end
    for (let i = documents.length - 1; i > currentIndex; i--) {
      if (canPreview(documents[i])) {
        onPrevious?.(documents[i].id);
        return;
      }
    }
  }, [getCurrentIndex, documents, canPreview, onPrevious]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
    setRotation(0);
  }, []);

  // Rotation handler
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
        case 'r':
          e.preventDefault();
          handleRotate();
          break;
        case 'd':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            document && onDownload?.(document.id);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrevious, handleZoomIn, handleZoomOut, handleZoomReset, handleRotate, document, onDownload]);

  // Reset state when document changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setError(null);
  }, [document?.id]);

  if (!isOpen || !document) return null;

  const previewUrl = getPreviewUrl(document);
  const currentIndex = getCurrentIndex();
  const totalPreviewable = documents.filter(canPreview).length;

  return (
    <div className={`preview-modal fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${className}`}>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 text-white p-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          
          {/* File Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-medium truncate" title={document.name}>
                {document.name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{formatFileSize(document.size_bytes)}</span>
                <span>{document.mime_type}</span>
                {totalPreviewable > 1 && (
                  <span>
                    {documents.filter((d, i) => i <= currentIndex && canPreview(d)).length} of {totalPreviewable}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            
            {/* Navigation */}
            {totalPreviewable > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Previous (←)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Next (→)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="w-px h-6 bg-white/30 mx-2" />
              </>
            )}

            {/* Zoom Controls (for images) */}
            {document.mime_type?.startsWith('image/') && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Zoom out (-)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-300 min-w-[4rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Zoom in (+)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleZoomReset}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Reset zoom (0)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={handleRotate}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Rotate (R)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <div className="w-px h-6 bg-white/30 mx-2" />
              </>
            )}

            {/* Actions */}
            {onDownload && (
              <button
                onClick={() => onDownload(document.id)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Download (⌘D)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(document.id)}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              title="Close (Esc)"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4 pt-20">
        
        {/* Preview Content */}
        <div ref={previewRef} className="relative max-w-full max-h-full overflow-hidden">
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center w-96 h-96 bg-white/10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center w-96 h-96 bg-white/10 rounded-lg text-white">
              <svg className="h-12 w-12 mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-center">{error}</p>
            </div>
          )}

          {/* Image Preview */}
          {document.mime_type?.startsWith('image/') && !isLoading && !error && (
            <img
              src={previewUrl}
              alt={document.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load image');
                setIsLoading(false);
              }}
            />
          )}

          {/* PDF Preview */}
          {document.mime_type?.includes('pdf') && !isLoading && !error && (
            <iframe
              src={previewUrl}
              className="w-full h-full min-w-[800px] min-h-[600px] bg-white rounded"
              title={`Preview of ${document.name}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load PDF');
                setIsLoading(false);
              }}
            />
          )}

          {/* Text Preview */}
          {(document.mime_type?.startsWith('text/') || document.mime_type?.includes('json')) && !isLoading && !error && (
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                {/* You'll need to fetch and display text content */}
                Loading text content...
              </pre>
            </div>
          )}

          {/* Unsupported File Type */}
          {!canPreview(document) && (
            <div className="flex flex-col items-center justify-center w-96 h-96 bg-white/10 rounded-lg text-white">
              <svg className="h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-center mb-4">Preview not available for this file type</p>
              {onDownload && (
                <button
                  onClick={() => onDownload(document.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download to view
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation arrows overlay */}
        {totalPreviewable > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              title="Previous image"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              title="Next image"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close preview"
      />
    </div>
  );
}