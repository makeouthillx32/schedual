// app/dashboard/[id]/Documents/page.tsx
'use client';

import React, { Suspense } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Documents from '@/components/documents';
import { DocumentSkeleton } from '@/components/documents/skeleton';

export default function DocumentsPage() {
  return (
    <>
      <Breadcrumb pageName="Documents" />
      
      <Suspense 
        fallback={<DocumentSkeleton viewMode="grid" count={12} />}
      >
        <DocumentsErrorBoundary>
          <Documents />
        </DocumentsErrorBoundary>
      </Suspense>
    </>
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="mb-2 text-xl font-semibold text-red-800 dark:text-red-200">
            Something went wrong
          </h2>
          
          <p className="mb-4 text-red-600 dark:text-red-400">
            The document management system encountered an error. Please try refreshing the page.
          </p>
          
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
          
          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-300">
                Error Details (Development)
              </summary>
              <pre className="mt-2 overflow-auto rounded border border-red-200 bg-red-100 p-4 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
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