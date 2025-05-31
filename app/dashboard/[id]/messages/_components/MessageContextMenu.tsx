// app/dashboard/[id]/messages/_components/MessageContextMenu.tsx
'use client';

import { Copy, Trash2, Download, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Attachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size: number;
}

interface MessageContextMenuProps {
  messageId: string | number;
  messageContent: string;
  messageElement: HTMLElement;
  canDelete: boolean;
  attachments?: Attachment[];
  onDelete: () => void;
  onCopy: (content: string) => void;
  onClose: () => void;
}

export default function MessageContextMenu({ 
  messageId, 
  messageContent, 
  messageElement, 
  canDelete,
  attachments = [],
  onDelete, 
  onCopy, 
  onClose 
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showAttachments, setShowAttachments] = useState(false);

  // Update menu position
  const updatePosition = () => {
    if (messageElement && menuRef.current) {
      const messageRect = messageElement.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let x = messageRect.left + messageRect.width / 2 - menuRect.width / 2;
      let y = messageRect.top - menuRect.height - 10;

      // Keep menu within viewport
      if (x < 10) x = 10;
      if (x + menuRect.width > viewport.width - 10) {
        x = viewport.width - menuRect.width - 10;
      }
      
      // If menu would go above viewport, show below message
      if (y < 10) {
        y = messageRect.bottom + 10;
      }

      setPosition({ x, y });
    }
  };

  // Setup event listeners and positioning
  useEffect(() => {
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

    const handleScroll = () => {
      updatePosition();
    };

    updatePosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    const intervalId = setInterval(updatePosition, 16);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
      clearInterval(intervalId);
    };
  }, [messageElement, onClose]);

  // Handle copy action
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(messageContent);
        toast.success('Message copied to clipboard');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = messageContent;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast.success('Message copied to clipboard');
        } catch (err) {
          toast.error('Failed to copy message');
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Failed to copy message');
    }
    onClose();
  };

  // Handle delete action
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  // Handle attachment download
  const handleDownloadAttachment = (attachment: Attachment) => {
    try {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${attachment.name}`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  // Handle attachment preview
  const handlePreviewAttachment = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('word')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    return '📄';
  };

  return (
    <div
      ref={menuRef}
      className="message-context-menu"
      style={{ 
        left: position.x, 
        top: position.y,
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        position: 'fixed',
        zIndex: 9999,
        minWidth: '160px',
        maxWidth: '280px',
        padding: '6px',
        animation: 'context-menu-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Main menu actions */}
      <button
        onClick={handleCopy}
        className="context-menu-item copy-item w-full flex items-center gap-2 p-2 rounded text-sm hover:bg-[hsl(var(--accent))] transition-colors"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        <Copy size={16} />
        Copy Message
      </button>

      {/* Show attachments if any */}
      {attachments.length > 0 && (
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="context-menu-item w-full flex items-center gap-2 p-2 rounded text-sm hover:bg-[hsl(var(--accent))] transition-colors"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          <ExternalLink size={16} />
          Attachments ({attachments.length})
        </button>
      )}

      {/* Attachment details */}
      {showAttachments && attachments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[hsl(var(--border))]">
          <div className="text-xs text-[hsl(var(--muted-foreground))] px-2 mb-2">
            Files attached to this message:
          </div>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-[hsl(var(--accent))] transition-colors"
            >
              <span className="text-sm flex-shrink-0">
                {getFileIcon(attachment.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" title={attachment.name}>
                  {attachment.name}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formatFileSize(attachment.size)}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePreviewAttachment(attachment)}
                  className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors"
                  title="Preview"
                >
                  <ExternalLink size={12} />
                </button>
                <button
                  onClick={() => handleDownloadAttachment(attachment)}
                  className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors"
                  title="Download"
                >
                  <Download size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete action (if user can delete) */}
      {canDelete && (
        <>
          <div className="border-t border-[hsl(var(--border))] my-1"></div>
          <button
            onClick={handleDelete}
            className="context-menu-item delete-item w-full flex items-center gap-2 p-2 rounded text-sm hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))] transition-colors"
            style={{ color: 'hsl(var(--destructive))' }}
          >
            <Trash2 size={16} />
            Delete Message
          </button>
        </>
      )}
    </div>
  );
}