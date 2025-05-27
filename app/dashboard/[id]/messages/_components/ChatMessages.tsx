'use client';

import { Heart, Trash2, MoreVertical, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';
import './ChatMessages.scss';

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Message {
  id: string | number;
  sender: { id: string; name: string; avatar: string; email: string; };
  content: string;
  timestamp: string;
  likes: number;
  image: string | null;
  attachments?: Array<{ id: string; url: string; type: string; name: string; size: number; }>;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  avatarColors: Record<string, string>;
  onMessageDelete?: (messageId: string | number) => void;
}

function ContextMenu({ x, y, messageContent, canDelete, onCopy, onDelete, onClose }: {
  x: number; y: number; messageContent: string; canDelete: boolean;
  onCopy: () => void; onDelete: () => void; onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 9999,
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '6px',
        minWidth: '160px'
      }}
    >
      <button
        onClick={onCopy}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '10px 12px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'calc(var(--radius) - 2px)',
          color: 'hsl(var(--foreground))',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'background-color 0.15s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Copy size={16} />
        Copy Message
      </button>
      
      {canDelete && (
        <button
          onClick={onDelete}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 'calc(var(--radius) - 2px)',
            color: 'hsl(var(--destructive))',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--destructive))';
            e.currentTarget.style.color = 'hsl(var(--destructive-foreground))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'hsl(var(--destructive))';
          }}
        >
          <Trash2 size={16} />
          Delete Message
        </button>
      )}
    </div>
  );
}

export default function ChatMessages({ messages, currentUserId, messagesEndRef, avatarColors, onMessageDelete }: ChatMessagesProps) {
  const [menu, setMenu] = useState<{ x: number; y: number; content: string; canDelete: boolean; messageId: string | number; } | null>(null);
  const [longPress, setLongPress] = useState<NodeJS.Timeout | null>(null);
  const [deleting, setDeleting] = useState<string | number | null>(null);

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar.startsWith('http')) return <img src={avatar} alt={name} className="w-full h-full object-cover" />;
    const colors = ['bg-[hsl(var(--chart-1))]', 'bg-[hsl(var(--chart-2))]', 'bg-[hsl(var(--chart-3))]', 'bg-[hsl(var(--chart-4))]', 'bg-[hsl(var(--chart-5))]'];
    const idx = avatar.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
    return <div className={`avatar-initials ${colors[idx]}`}><span className="text-xs font-semibold uppercase text-[hsl(var(--primary-foreground))]">{avatar}</span></div>;
  };

  const showMenu = (e: React.MouseEvent | React.TouchEvent, msg: Message) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const viewport = { w: window.innerWidth, h: window.innerHeight };
    
    let x = rect.left + rect.width / 2;
    let y = rect.top - 10;
    
    if (x > viewport.w - 100) x = viewport.w - 100;
    if (x < 10) x = 10;
    if (y < 50) y = rect.bottom + 10;
    
    setMenu({
      x,
      y,
      content: msg.content,
      canDelete: msg.sender.id === currentUserId,
      messageId: msg.id
    });
  };

  const handleCopy = async () => {
    if (!menu) return;
    try {
      await navigator.clipboard.writeText(menu.content);
      toast.success('Copied to clipboard');
    } catch {
      const el = document.createElement('textarea');
      el.value = menu.content;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast.success('Copied to clipboard');
    }
    setMenu(null);
  };

  const handleDelete = async () => {
    if (!menu) return;
    try {
      setDeleting(menu.messageId);
      setMenu(null);
      const { error } = await supabase.from('messages').delete().eq('id', menu.messageId);
      if (error) throw error;
      onMessageDelete?.(menu.messageId);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="chat-messages" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      {messages.map((msg) => {
        const isMe = msg.sender.id === currentUserId;
        const isDeleting = deleting === msg.id;
        
        return (
          <div key={String(msg.id)} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3 ${isDeleting ? 'opacity-50' : ''}`}>
            {!isMe && (
              <div className="flex-shrink-0 mr-2">
                <div className="message-avatar rounded-full overflow-hidden shadow-[var(--shadow-xs)]">
                  {renderAvatar(msg.sender.avatar, msg.sender.name)}
                </div>
              </div>
            )}

            <div className={`message ${isMe ? 'order-1' : 'order-2'} relative group`}>
              {!isMe && <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1 ml-1">{msg.sender.name}</div>}
              
              <div className="flex flex-col">
                <div
                  className={`message-bubble cursor-pointer relative ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'} rounded-[var(--radius)]`}
                  style={{
                    backgroundColor: isMe ? 'hsl(var(--sidebar-primary))' : 'hsl(var(--muted))',
                    color: isMe ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--foreground))',
                    boxShadow: 'var(--shadow-md)',
                    padding: '8px 12px'
                  }}
                  onContextMenu={(e) => showMenu(e, msg)}
                  onTouchStart={(e) => {
                    const timer = setTimeout(() => {
                      navigator.vibrate?.(50);
                      showMenu(e, msg);
                    }, 500);
                    setLongPress(timer);
                  }}
                  onTouchEnd={() => {
                    if (longPress) {
                      clearTimeout(longPress);
                      setLongPress(null);
                    }
                  }}
                  onTouchCancel={() => {
                    if (longPress) {
                      clearTimeout(longPress);
                      setLongPress(null);
                    }
                  }}
                >
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <div className="rounded-full p-1" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                      <MoreVertical size={12} className="text-[hsl(var(--muted-foreground))]" />
                    </div>
                  </div>

                  {msg.content && <p className="text-sm break-words">{msg.content}</p>}

                  {msg.image && (
                    <div className="mt-2 overflow-hidden rounded" style={{ maxHeight: '200px', maxWidth: '300px' }}>
                      <img src={msg.image} alt="Shared" style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'cover' }} />
                    </div>
                  )}

                  {msg.attachments?.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 p-2 mt-2 rounded" style={{ backgroundColor: 'hsl(var(--background)/0.5)', border: '1px solid hsl(var(--border)/0.5)' }}>
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                        {att.type === 'image' ? <img src={att.url} className="w-full h-full object-cover rounded" /> : <span>📄</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href={att.url} target="_blank" className="text-xs font-medium hover:underline block truncate">{att.name}</a>
                        <p className="text-xs opacity-70">{Math.round(att.size / 1024)}KB</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center mt-1 ml-1">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </span>
                  {msg.likes > 0 && (
                    <div className="ml-2 flex items-center text-xs text-[hsl(var(--destructive))]">
                      <Heart size={12} fill="currentColor" className="mr-1" />
                      {msg.likes}
                    </div>
                  )}
                  {isDeleting && <div className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">Deleting...</div>}
                </div>
              </div>
            </div>

            {isMe && (
              <div className="flex-shrink-0 ml-2">
                <div className="message-avatar rounded-full overflow-hidden shadow-[var(--shadow-xs)]">
                  {renderAvatar(msg.sender.avatar, msg.sender.name)}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          messageContent={menu.content}
          canDelete={menu.canDelete}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onClose={() => setMenu(null)}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}