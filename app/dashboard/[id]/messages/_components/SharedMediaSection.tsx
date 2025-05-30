// app/dashboard/[id]/messages/_components/SharedMediaSection.tsx
'use client';

import { ChevronDown, ChevronRight, Image, ExternalLink } from 'lucide-react';

interface SharedMedia {
  id: string;
  url: string;
  type: 'image' | 'file';
  name: string;
  size: number;
  created_at: string;
  sender_name: string;
}

interface SharedMediaSectionProps {
  sharedMedia: SharedMedia[];
  loadingMedia: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function SharedMediaSection({ 
  sharedMedia, 
  loadingMedia, 
  isCollapsed, 
  onToggle 
}: SharedMediaSectionProps) {
  
  return (
    <div style={{
      backgroundColor: 'hsl(var(--card))',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <button
        onClick={onToggle}
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
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {!isCollapsed && (
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
  );
}