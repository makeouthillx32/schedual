// app/dashboard/[id]/Documents/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Documents from '@/components/documents';
import { DocumentSkeleton } from '@/components/documents/Skeleton';

interface DocumentsPageProps {
  params: {
    id: string;
  };
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  // Get the dashboard ID from params
  const { id } = useParams();

  return (
    <div className="documents-page min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Document Management
              </h1>
              <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Organize, upload, and manage your files and folders
              </p>
            </div>
            
            {/* Optional: Dashboard context info */}
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Dashboard: {id}
            </div>
          </div>
        </div>

        {/* Documents Component with Error Boundary */}
        <Suspense 
          fallback={
            <DocumentsLoadingFallback />
          }
        >
          <DocumentsErrorBoundary>
            <Documents className="documents-main" />
          </DocumentsErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
}

// Loading fallback component
function DocumentsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div 
          className="h-8 rounded w-1/4 mb-4" 
          style={{ backgroundColor: 'var(--muted)' }}
        ></div>
        <div 
          className="h-12 rounded mb-6" 
          style={{ backgroundColor: 'var(--muted)' }}
        ></div>
      </div>
      <DocumentSkeleton viewMode="grid" count={12} />
    </div>
  );
}

// Error Boundary Component for Documents
class DocumentsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Documents Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="documents-error-boundary border rounded-lg p-8 text-center"
          style={{ 
            backgroundColor: 'var(--destructive-background)',
            borderColor: 'var(--destructive-border)',
            color: 'var(--destructive-foreground)'
          }}
        >
          <div 
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--destructive)' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">
            Something went wrong
          </h2>
          
          <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
            The document management system encountered an error. Please try refreshing the page.
          </p>
          
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--destructive-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--destructive)';
              }}
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
              }}
            >
              Try Again
            </button>
          </div>
          
          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary 
                className="cursor-pointer text-sm font-medium"
                style={{ color: 'var(--accent-foreground)' }}
              >
                Error Details (Development)
              </summary>
              <pre 
                className="mt-2 p-4 border rounded text-xs overflow-auto"
                style={{ 
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}