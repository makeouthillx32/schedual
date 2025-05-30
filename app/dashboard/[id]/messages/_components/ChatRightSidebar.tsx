// app/dashboard/[id]/messages/_components/ChatRightSidebar.tsx
'use client';

import { Image, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtime } from '@/hooks/useRealtimeInsert';
import { toast } from 'react-hot-toast';
import ChatRightSidebarHeader from './ChatRightSidebarHeader';
import ChatInfoSection from './ChatInfoSection';
import ParticipantsSection from './ParticipantsSection';
import ActionsSection from './ActionsSection';
import SharedMediaSection from './SharedMediaSection';
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
  onConversationDeleted?: (channelId: string) => void;
}

export default function ChatRightSidebar({
  selectedChatName,
  participants: initialParticipants,
  avatarColors,
  isGroup = false,
  channelId,
  onClose,
  onConversationDeleted
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [participants, setParticipants] = useState(initialParticipants);
  const [sharedMedia, setSharedMedia] = useState<SharedMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  // Toggle section collapse
  const toggleSection = (section: 'about' | 'actions' | 'media') => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle delete conversation

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
      <ChatRightSidebarHeader 
        isGroup={isGroup} 
        onClose={onClose} 
      />

      <ChatInfoSection 
        selectedChatName={selectedChatName}
        participantCount={participants.length}
        isGroup={isGroup}
      />

      <ParticipantsSection 
        participants={participants}
        isGroup={isGroup}
        isCollapsed={sectionsCollapsed.about}
        onToggle={() => toggleSection('about')}
      />

      <ActionsSection 
        isGroup={isGroup}
        isCollapsed={sectionsCollapsed.actions}
        channelId={channelId}
        onToggle={() => toggleSection('actions')}
        onConversationDeleted={onConversationDeleted}
        onClose={onClose}
      />

      <SharedMediaSection 
        sharedMedia={sharedMedia}
        loadingMedia={loadingMedia}
        isCollapsed={sectionsCollapsed.media}
        onToggle={() => toggleSection('media')}
      />
    </div>
  );
}