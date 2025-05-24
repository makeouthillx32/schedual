'use client';

import { Heart, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';
import './mobile.scss';

// Create Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Attachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size: number;
}

interface Message {
  id: string | number;
  sender: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  image: string | null;
  attachments?: Attachment[];
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  avatarColors: Record<string, string>;
  onMessageDelete?: (messageId: string | number) => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}

// Context menu component
function MessageContextMenu({ x, y, onDelete, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="message-context-menu"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onDelete}
        className="context-menu-item delete-item"
      >
        <Trash2 size={16} />
        Delete Message
      </button>
    </div>
  );
}

export default function ChatMessages({
  messages,
  currentUserId,
  messagesEndRef,
  avatarColors,
  onMessageDelete
}: ChatMessagesProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string | number;
  } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      );
    }
    
    const chartColors = [
      'bg-[hsl(var(--chart-1))]',
      'bg-[hsl(var(--chart-2))]',
      'bg-[hsl(var(--chart-3))]',
      'bg-[hsl(var(--chart-4))]',
      'bg-[hsl(var(--chart-5))]'
    ];
    
    const index = avatar.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % chartColors.length;
    
    return (
      <div className={`avatar-initials ${chartColors[index]}`}>
        <span className="text-xs font-semibold uppercase text-[hsl(var(--primary-foreground))]">{avatar}</span>
      </div>
    );
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, messageId: string | number, senderId: string) => {
    // Only allow deletion of own messages
    if (senderId !== currentUserId) return;
    
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId
    });
  };

  // Handle long press for mobile
  const handleTouchStart = (messageId: string | number, senderId: string) => {
    // Only allow deletion of own messages
    if (senderId !== currentUserId) return;
    
    const timer = setTimeout(() => {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Show context menu at center of screen for mobile
      setContextMenu({
        x: window.innerWidth / 2 - 100, // Center horizontally
        y: window.innerHeight / 2 - 50, // Center vertically
        messageId
      });
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Delete message function
  const deleteMessage = async (messageId: string | number) => {
    try {
      setIsDeleting(messageId);
      setContextMenu(null);

      // Delete from Supabase
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete message');
        return;
      }

      // Call parent callback to update UI
      if (onMessageDelete) {
        onMessageDelete(messageId);
      }

      toast.success('Message deleted');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(null);
    }
  };

  // Format file size for attachments
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="chat-messages">
      {messages.map((message) => {
        const isCurrentUser = message.sender.id === currentUserId;
        const canDelete = isCurrentUser;
        const isBeingDeleted = isDeleting === message.id;
        
        return (
          <div
            key={String(message.id)}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3 ${
              isBeingDeleted ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {!isCurrentUser && (
              <div className="flex-shrink-0 mr-2">
                <div className="message-avatar rounded-full overflow-hidden shadow-[var(--shadow-xs)]">
                  {renderAvatar(message.sender.avatar, message.sender.name)}
                </div>
              </div>
            )}

            <div className={`message ${isCurrentUser ? 'order-1' : 'order-2'} relative group`}>
              {!isCurrentUser && (
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1 ml-1 font-[var(--font-sans)]">
                  {message.sender.name}
                </div>
              )}

              <div className="flex flex-col">
                <div
                  className={`message-bubble shadow-[var(--shadow-xs)] relative ${
                    isCurrentUser
                      ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-tr-none'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-tl-none'
                  } rounded-[var(--radius)] ${canDelete ? 'cursor-pointer' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, message.id, message.sender.id)}
                  onTouchStart={() => handleTouchStart(message.id, message.sender.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  {/* Delete indicator for own messages */}
                  {canDelete && (
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:block hidden">
                      <div className="bg-[hsl(var(--muted))] rounded-full p-1 shadow-sm">
                        <MoreVertical size={12} className="text-[hsl(var(--muted-foreground))]" />
                      </div>
                    </div>
                  )}

                  {message.content && (
                    <p className="text-sm break-words">{message.content}</p>
                  )}

                  {/* Display image - FIXED WITH PROPER CONSTRAINTS */}
                  {message.image && (
                    <div className="mt-2 message-image overflow-hidden rounded-[calc(var(--radius)_-_2px)]" style={{ maxHeight: '200px', maxWidth: '300px' }}>
                      <img
                        src={message.image}
                        alt="Shared"
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          maxHeight: '200px', 
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22100%22%20height=%22100%22%20viewBox=%220%200%20100%20100%22%3E%3Cpath%20fill=%22%23CCC%22%20d=%22M0%200h100v100H0z%22/%3E%3Cpath%20fill=%22%23999%22%20d=%22M40%2040h20v20H40z%22/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}

                  {/* Display attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 rounded bg-[hsl(var(--background))/0.5] border border-[hsl(var(--border))/0.5]"
                        >
                          <div className="flex-shrink-0">
                            {attachment.type === 'image' ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded flex items-center justify-center">
                                <span className="text-xs">📄</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium hover:underline block truncate"
                            >
                              {attachment.name}
                            </a>
                            <p className="text-xs opacity-70">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-1 ml-1">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatMessageTime(message.timestamp)}
                  </span>

                  {message.likes > 0 && (
                    <div className="ml-2 flex items-center text-xs text-[hsl(var(--destructive))]">
                      <Heart size={12} fill="currentColor" className="mr-1" />
                      {message.likes}
                    </div>
                  )}

                  {isBeingDeleted && (
                    <div className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                      Deleting...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isCurrentUser && (
              <div className="flex-shrink-0 ml-2">
                <div className="message-avatar rounded-full overflow-hidden shadow-[var(--shadow-xs)]">
                  {renderAvatar(message.sender.avatar, message.sender.name)}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => deleteMessage(contextMenu.messageId)}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}