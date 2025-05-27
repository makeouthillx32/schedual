'use client';

import { Image, X, Pencil, ChevronDown, ChevronRight, Search, Bell, UserPlus, Trash2, Download, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtime } from '@/hooks/useRealtimeInsert';
import { toast } from 'react-hot-toast';
import './ChatRightSidebar.scss';

// Create Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Participant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  online: boolean;
}

interface SharedMedia {
  id: string;
  url: string;
  type: 'image' | 'file';
  name: string;
  size: number;
  created_at: string;
  sender_name: string;
}

interface Props {
  selectedChatName: string;
  participants: Participant[];
  avatarColors: Record<string, string>;
  isGroup?: boolean;
  channelId?: string;
  onClose: () => void;
}

export default function ChatRightSidebar({
  selectedChatName,
  participants: initialParticipants,
  avatarColors,
  isGroup = false,
  channelId,
  onClose
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [participants, setParticipants] = useState(initialParticipants);
  const [sharedMedia, setSharedMedia] = useState<SharedMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Collapsible sections state
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    about: false,
    actions: true, // Start collapsed to save space
    media: false
  });
  
  const isMounted = useRef(true);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Update participants when props change
  useEffect(() => {
    if (isMounted.current) {
      setParticipants(initialParticipants);
    }
  }, [initialParticipants]);
  
  // Fetch shared media when component mounts or channelId changes
  useEffect(() => {
    if (channelId) {
      fetchSharedMedia();
    }
  }, [channelId]);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Monitor presence/online status changes
  useRealtime<any>({
    supabase,
    table: 'presence',
    filter: channelId ? `channel_id=eq.${channelId}` : undefined,
    event: '*',
    onEvent: ({ new: newState, old: oldState, eventType }) => {
      if (!isMounted.current || !channelId) return;
      
      console.log(`[RightSidebar] Presence event: ${eventType}`, newState);
      
      // Handle presence updates (if presence system exists)
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        setParticipants(prev => {
          return prev.map(p => {
            if (p.id === newState.user_id) {
              return {
                ...p,
                online: newState.status === 'online'
              };
            }
            return p;
          });
        });
      }
    }
  });

  // Fetch shared media from messages
  const fetchSharedMedia = async () => {
    if (!channelId) return;
    
    try {
      setLoadingMedia(true);
      console.log(`[RightSidebar] Fetching shared media for channel: ${channelId}`);
      
      // Get messages with attachments and images
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          image,
          created_at,
          sender:profiles!messages_sender_id_fkey(display_name),
          message_attachments (
            id,
            file_url,
            file_type,
            file_name,
            file_size
          )
        `)
        .eq('channel_id', channelId)
        .or('image.not.is.null,message_attachments.file_url.not.is.null')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[RightSidebar] Error fetching shared media:', error);
        return;
      }

      if (!isMounted.current) return;

      const mediaItems: SharedMedia[] = [];
      
      messages?.forEach(message => {
        // Add images from message.image field
        if (message.image) {
          mediaItems.push({
            id: `image-${message.id}`,
            url: message.image,
            type: 'image',
            name: 'Image',
            size: 0, // Size not available for direct images
            created_at: message.created_at,
            sender_name: message.sender?.display_name || 'Unknown'
          });
        }
        
        // Add attachments
        message.message_attachments?.forEach(attachment => {
          mediaItems.push({
            id: attachment.id,
            url: attachment.file_url,
            type: attachment.file_type?.startsWith('image/') ? 'image' : 'file',
            name: attachment.file_name || 'File',
            size: attachment.file_size || 0,
            created_at: message.created_at,
            sender_name: message.sender?.display_name || 'Unknown'
          });
        });
      });
      
      // Sort by date (newest first)
      mediaItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setSharedMedia(mediaItems);
      console.log(`[RightSidebar] Loaded ${mediaItems.length} shared media items`);
      
    } catch (err) {
      console.error('[RightSidebar] Error fetching shared media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Chart colors from design system for avatar backgrounds
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={`${name}'s avatar`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    // Calculate a deterministic index based on avatar string
    const index = avatar.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % chartColors.length;
    
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: chartColors[index]
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: 'hsl(var(--primary-foreground))'
        }}>
          {avatar}
        </span>
      </div>
    );
  };

  // Toggle section collapse
  const toggleSection = (section: 'about' | 'actions' | 'media') => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Action handlers
  const handleSearchInConversation = () => {
    toast.success('Search functionality coming soon!');
  };

  const handleNotificationSettings = () => {
    toast.success('Notification settings coming soon!');
  };

  const handleAddParticipants = () => {
    toast.success('Add participants functionality coming soon!');
  };

  const handleDeleteConversation = () => {
    const action = isGroup ? 'leave this group' : 'delete this conversation';
    if (window.confirm(`Are you sure you want to ${action}?`)) {
      toast.success(`${isGroup ? 'Left group' : 'Conversation deleted'} successfully!`);
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Determine if we should show as overlay (mobile/tablet) or sidebar (desktop)
  const shouldShowAsOverlay = isMobile || isTablet;

  if (!isOpen) {
    return (
      <div style={{
        width: '48px',
        display: shouldShowAsOverlay ? 'none' : 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))'
      }} className="lg:flex">
        <button 
          onClick={() => setIsOpen(true)} 
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            borderRadius: 'var(--radius)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Pencil size={16} />
        </button>
        <button 
          onClick={() => setIsOpen(true)} 
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            borderRadius: 'var(--radius)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Image size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      backgroundColor: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-md)',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        flexShrink: 0
      }}>
        <h3 style={{
          fontWeight: '600',
          color: 'hsl(var(--card-foreground))',
          margin: 0,
          fontSize: '16px'
        }}>
          {isGroup ? 'Group Info' : 'Chat Info'}
        </h3>
        <button 
          onClick={onClose} 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--muted-foreground))',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'hsl(var(--foreground))';
            e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Chat/Group Info */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        flexShrink: 0
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'hsl(var(--sidebar-primary))',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {isGroup ? (
            <span style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'hsl(var(--sidebar-primary-foreground))'
            }}>G</span>
          ) : (
            <span style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'hsl(var(--sidebar-primary-foreground))'
            }}>
              {selectedChatName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 style={{
          fontWeight: '600',
          fontSize: '16px',
          textAlign: 'center',
          color: 'hsl(var(--card-foreground))',
          margin: '0 0 4px 0'
        }}>{selectedChatName}</h3>
        <p style={{
          fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          textAlign: 'center',
          margin: 0
        }}>
          {participants.length}{' '}
          {participants.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      {/* About/Participants Section */}
      <div style={{
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        flexShrink: 0
      }}>
        <button
          onClick={() => toggleSection('about')}
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent) / 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span>{isGroup ? 'Participants' : 'About'}</span>
          {sectionsCollapsed.about ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {!sectionsCollapsed.about && (
          <div style={{ padding: '0 16px 12px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {participants.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    marginRight: '8px',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    {renderAvatar(p.avatar, p.name)}
                    {p.online && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'hsl(var(--chart-2))',
                        borderRadius: '50%',
                        border: '1px solid hsl(var(--background))'
                      }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: '500',
                      color: 'hsl(var(--card-foreground))',
                      margin: 0,
                      fontSize: '14px'
                    }}>{p.name}</p>
                    <p style={{
                      fontSize: '11px',
                      color: 'hsl(var(--muted-foreground))',
                      margin: 0
                    }}>
                      {p.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div style={{
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        flexShrink: 0
      }}>
        <button
          onClick={() => toggleSection('actions')}
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent) / 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span>Actions</span>
          {sectionsCollapsed.actions ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {!sectionsCollapsed.actions && (
          <div style={{ padding: '0 16px 12px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                onClick={handleSearchInConversation}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--foreground))',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Search size={14} />
                Search in conversation
              </button>
              <button 
                onClick={handleNotificationSettings}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--foreground))',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Bell size={14} />
                Notification settings
              </button>
              {isGroup && (
                <button 
                  onClick={handleAddParticipants}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--foreground))',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserPlus size={14} />
                  Add participants
                </button>
              )}
              <button 
                onClick={handleDeleteConversation}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--destructive))',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={14} />
                {isGroup ? 'Leave group' : 'Delete conversation'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shared Media Section */}
      <div style={{
        backgroundColor: 'hsl(var(--card))',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <button
          onClick={() => toggleSection('media')}
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent) / 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span>Shared Media ({sharedMedia.length})</span>
          {sectionsCollapsed.media ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {!sectionsCollapsed.media && (
          <div style={{ 
            padding: '0 16px 16px 16px', 
            flex: 1,
            overflowY: 'auto'
          }}>
            {loadingMedia ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '14px'
              }}>
                Loading media...
              </div>
            ) : sharedMedia.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                <Image size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No shared media yet</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                  Images and files will appear here
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px'
              }}>
                {sharedMedia.map((media) => (
                  <div
                    key={media.id}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-xs)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => window.open(media.url, '_blank')}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = e.target.parentNode as HTMLElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div style="width: 100%; height: 100%; background: hsl(var(--muted)); display: flex; align-items: center; justify-content: center;">
                                <span style="color: hsl(var(--muted-foreground)); font-size: 20px;">📷</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'hsl(var(--muted))',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}>
                        <span style={{ fontSize: '16px', marginBottom: '2px' }}>📄</span>
                        <span style={{
                          fontSize: '8px',
                          color: 'hsl(var(--muted-foreground))',
                          textAlign: 'center',
                          lineHeight: '1.2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%'
                        }}>
                          {media.name.length > 10 ? media.name.substring(0, 10) + '...' : media.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <ExternalLink size={16} style={{ color: 'white' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}