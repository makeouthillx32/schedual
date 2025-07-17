// components/Docustore/ContextMenu/index.tsx
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { DocumentItem } from '@/hooks/useDocuments';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  document?: DocumentItem;
  onClose: () => void;
  onAction: (action: string, documentId: string) => void;
  className?: string;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  dangerous?: boolean;
  separator?: boolean;
}

export default function ContextMenu({
  isOpen,
  position,
  document,
  onClose,
  onAction,
  className = ''
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle action click
  const handleAction = useCallback((actionId: string) => {
    if (document) {
      onAction(actionId, document.id);
    }
    onClose();
  }, [document, onAction, onClose]);

  // Check if file can be previewed
  const canPreview = useCallback(() => {
    if (!document?.mime_type) return false;
    const mimeType = document.mime_type.toLowerCase();
    return mimeType.startsWith('image/') || 
           mimeType.includes('pdf') || 
           mimeType.startsWith('text/') ||
           mimeType.includes('json');
  }, [document?.mime_type]);

  // Get menu actions based on document type
  const getMenuActions = useCallback((): MenuAction[] => {
    if (!document) return [];

    const isFolder = document.type === 'folder';
    const isFile = document.type === 'file';

    const actions: MenuAction[] = [];

    // Preview (files only)
    if (isFile && canPreview()) {
      actions.push({
        id: 'preview',
        label: 'Preview',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        shortcut: 'Space'
      });
    }

    // Open (folders only)
    if (isFolder) {
      actions.push({
        id: 'open',
        label: 'Open',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        ),
        shortcut: '⏎'
      });
    }

    // Download (files only)
    if (isFile) {
      actions.push({
        id: 'download',
        label: 'Download',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        ),
        shortcut: '⌘D'
      });
    }

    // Separator
    if (actions.length > 0) {
      actions.push({ id: 'sep1', label: '', icon: null, separator: true });
    }

    // Rename
    actions.push({
      id: 'rename',
      label: 'Rename',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      shortcut: 'F2'
    });

    // Duplicate
    actions.push({
      id: 'duplicate',
      label: 'Duplicate',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      shortcut: '⌘D'
    });

    // Move
    actions.push({
      id: 'move',
      label: 'Move to...',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
      ),
      shortcut: '⌘X'
    });

    // Separator
    actions.push({ id: 'sep2', label: '', icon: null, separator: true });

    // Add to favorites / Remove from favorites
    actions.push({
      id: 'favorite',
      label: document.is_favorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: (
        <svg className="h-4 w-4" fill={document.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      shortcut: '⌘F'
    });

    // Share
    actions.push({
      id: 'share',
      label: 'Share',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      shortcut: '⌘S'
    });

    // Copy link
    actions.push({
      id: 'copyLink',
      label: 'Copy Link',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      shortcut: '⌘L'
    });

    // Separator
    actions.push({ id: 'sep3', label: '', icon: null, separator: true });

    // Properties/Info
    actions.push({
      id: 'info',
      label: 'Properties',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      shortcut: '⌘I'
    });

    // Separator
    actions.push({ id: 'sep4', label: '', icon: null, separator: true });

    // Delete
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      shortcut: 'Del',
      dangerous: true
    });

    return actions;
  }, [document, canPreview]);

  // Position menu to stay within viewport
  const getMenuPosition = useCallback(() => {
    if (!menuRef.current) return position;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let { x, y } = position;

    // Adjust horizontal position
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewport.height) {
      y = viewport.height - rect.height - 10;
    }
    if (y < 10) {
      y = 10;
    }

    return { x, y };
  }, [position]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const menuPosition = getMenuPosition();
  const menuActions = getMenuActions();

  return (
    <div
      ref={menuRef}
      className={`context-menu fixed z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg outline-none dark:border-gray-700 dark:bg-gray-800 ${className}`}
      style={{
        left: menuPosition.x,
        top: menuPosition.y
      }}
      tabIndex={-1}
      role="menu"
      aria-label="Context menu"
    >
      {menuActions.map((action) => {
        if (action.separator) {
          return (
            <div
              key={action.id}
              className="my-1 h-px bg-gray-200 dark:bg-gray-700"
              role="separator"
            />
          );
        }

        return (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={action.disabled}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
              action.dangerous
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            } ${
              action.disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            }`}
            role="menuitem"
            disabled={action.disabled}
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0">{action.icon}</span>
              <span>{action.label}</span>
            </div>
            {action.shortcut && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                {action.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}