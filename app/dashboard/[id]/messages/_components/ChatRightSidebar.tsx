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
import { resolveChatDisplayName } from '@/utils/chatPageUtils';
import './ChatRightSidebar.scss';

// Create Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Avatar colors - moved here from page
const AVATAR_COLORS = {
  AL: 'bg-blue-500',
  JA: 'bg-orange-500',
  JE: 'bg-green-500',
};

// Chart colors for deterministic avatar generation
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

interface Participant {
  user_id: string;
  display_name: string;
  avatar_url: string;
  email: string;
  online: boolean;
}

interface SelectedChat {
  id: string;
  channel_id: string;
  channel_name: string;
  is_group: boolean;
  participants: Participant[];
  last_message_at: string | null;
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
  selectedChat: SelectedChat;
  currentUserId?: string | null;
  onClose: () => void;
  onConversationDeleted?: (channelId: string) => void;
}

export default function ChatRightSidebar({
  selectedChat,
  currentUserId,
  onClose,
  onConversationDeleted
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [participants, setParticipants] = useState(selectedChat.participants);
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

  // Compute values from selectedChat
  const resolvedName = resolveChatDisplayName(selectedChat, currentUserId);
  const channelId = selectedChat.id;
  const isGroup = selectedChat.is_group;

  // Transform participants for display
  const displayParticipants = participants.map((p) => ({
    id: p.user_id,
    name: p.display_name,
    avatar: p.avatar_url,
    email: p.email,
    online: p.online,
  }));

  // Generate avatar color deterministically
  const getAvatarColor = (name: string) => {
    const hashValue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hashValue % CHART_COLORS.length;
    return CHART_COLORS[colorIndex];
  };

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

  // Update participants when selectedChat changes
  useEffect(() => {
    if (isMounted.current) {
      setParticipants(selectedChat.participants);
    }
  }, [selectedChat.participants]);
  
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
            if (p.user_id === newState.user_id) {
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
        selectedChatName={resolvedName}
        participantCount={participants.length}
        isGroup={isGroup}
      />

      <ParticipantsSection 
        participants={displayParticipants}
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