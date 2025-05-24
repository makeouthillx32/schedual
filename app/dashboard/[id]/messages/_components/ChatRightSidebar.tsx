'use client';

import { Image, X, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtime } from '@/hooks/useRealtimeInsert';
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
  const isMounted = useRef(true);

  // Update participants when props change
  useEffect(() => {
    if (isMounted.current) {
      setParticipants(initialParticipants);
    }
  }, [initialParticipants]);
  
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

  if (!isOpen) {
    return (
      <div style={{
        width: '48px',
        display: 'none',
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
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))'
      }}>
        <h3 style={{
          fontWeight: '600',
          color: 'hsl(var(--card-foreground))',
          margin: 0
        }}>
          {isGroup ? 'Group Info' : 'Chat Info'}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius)',
              display: window.innerWidth >= 1024 ? 'block' : 'none'
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
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius)',
              display: window.innerWidth < 1024 ? 'block' : 'none'
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
      </div>

      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
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
              fontSize: '24px',
              fontWeight: '600',
              color: 'hsl(var(--sidebar-primary-foreground))'
            }}>G</span>
          ) : (
            <span style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'hsl(var(--sidebar-primary-foreground))'
            }}>
              {selectedChatName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 style={{
          fontWeight: '600',
          fontSize: '18px',
          textAlign: 'center',
          color: 'hsl(var(--card-foreground))',
          margin: '0 0 4px 0'
        }}>{selectedChatName}</h3>
        <p style={{
          fontSize: '14px',
          color: 'hsl(var(--muted-foreground))',
          textAlign: 'center',
          margin: 0
        }}>
          {participants.length}{' '}
          {participants.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      <div style={{
        padding: '16px',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        overflowY: 'auto'
      }}>
        <h4 style={{
          marginBottom: '12px',
          fontWeight: '600',
          fontSize: '14px',
          color: 'hsl(var(--foreground))',
          margin: '0 0 12px 0'
        }}>
          {isGroup ? 'Participants' : 'About'}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {participants.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
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
                    width: '8px',
                    height: '8px',
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
                  margin: 0
                }}>{p.name}</p>
                <p style={{
                  fontSize: '12px',
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

      <div style={{
        padding: '16px',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))'
      }}>
        <h4 style={{
          marginBottom: '12px',
          fontWeight: '600',
          fontSize: '14px',
          color: 'hsl(var(--foreground))',
          margin: '0 0 12px 0'
        }}>Actions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{
            width: '100%',
            padding: '8px 12px',
            textAlign: 'left',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Search in conversation
          </button>
          <button style={{
            width: '100%',
            padding: '8px 12px',
            textAlign: 'left',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Notification settings
          </button>
          {isGroup && (
            <button style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              borderRadius: 'var(--radius)',
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--foreground))',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Add participants
            </button>
          )}
          <button style={{
            width: '100%',
            padding: '8px 12px',
            textAlign: 'left',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--destructive))',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isGroup ? 'Leave group' : 'Delete conversation'}
          </button>
        </div>
      </div>

      <div style={{
        padding: '16px',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))'
      }}>
        <h4 style={{
          marginBottom: '12px',
          fontWeight: '600',
          fontSize: '14px',
          color: 'hsl(var(--foreground))',
          margin: '0 0 12px 0'
        }}>Shared Media</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <Image size={20} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
          ))}
          <button style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius)',
            border: '2px dashed hsl(var(--border))',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--muted-foreground))',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(var(--sidebar-primary))'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border))'}
          >
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}