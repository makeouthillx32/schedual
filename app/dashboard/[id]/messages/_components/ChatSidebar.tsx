// app/dashboard/[id]/messages/_components/ChatSidebar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { createBrowserClient } from '@supabase/ssr';
import NewChatModal from './NewChatModal';
import ChatSidebarHeader from './ChatSidebarHeader';
import ChatSidebarSearch from './ChatSidebarSearch';
import ConversationList from './ConversationList';
import { useRealtimeInsert, useRealtime } from '@/hooks/useRealtimeInsert';
import { storage, CACHE_KEYS } from '@/lib/cookieUtils';
import './ChatSidebar.scss';

// Types
export interface Participant {
  user_id: string;
  display_name: string;
  avatar_url: string;
  email: string;
  online: boolean;
}

export interface Conversation {
  id: string;
  channel_id: string;
  channel_name: string;
  is_group: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  participants: Participant[];
}

interface ChatSidebarProps {
  selectedChat: Conversation | null;
  onSelectChat: (chat: Conversation) => void;
  onConversationDeleted?: (channelId: string) => void;
  className?: string;
}

export default function ChatSidebar({ 
  selectedChat, 
  onSelectChat,
  onConversationDeleted,
  className = ""
}: ChatSidebarProps) {
  // Internal state - ChatSidebar manages its own conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Refs for lifecycle management
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const hasFetched = useRef(false);
  
  // Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Initialize current user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const cachedUser = storage.get(CACHE_KEYS.CURRENT_USER);
        if (cachedUser?.id) {
          setCurrentUserId(cachedUser.id);
          return;
        }

        const { data, error } = await supabase.auth.getUser();
        if (!isMounted.current) return;
        
        if (error) {
          console.error('[ChatSidebar] Auth error:', error);
          return;
        }
        
        if (data?.user?.id) {
          setCurrentUserId(data.user.id);
          storage.set(CACHE_KEYS.CURRENT_USER, data.user, 3600);
          console.log('[ChatSidebar] User authenticated:', data.user.id);
        }
      } catch (err) {
        console.error('[ChatSidebar] Error initializing user:', err);
      }
    };

    initializeUser();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch conversations from API
  const fetchConversations = async (forceRefresh = false) => {
    if (!forceRefresh && hasFetched.current && Date.now() - lastFetchTime.current < 30000) {
      return;
    }

    const cachedData = storage.get(CACHE_KEYS.CONVERSATIONS);
    if (!forceRefresh && cachedData && !hasFetched.current) {
      setConversations(cachedData);
      setIsLoading(false);
      return;
    }

    try {
      hasFetched.current = true;
      lastFetchTime.current = Date.now();
      if (!cachedData || forceRefresh) setIsLoading(true);

      console.log('[ChatSidebar] Fetching conversations from server');

      const res = await fetch('/api/messages/get-conversations');
      if (!isMounted.current) return;
      if (!res.ok) throw new Error('Failed to fetch conversations');

      const raw = await res.json();
      const mapped: Conversation[] = raw.map((c: any) => ({
        id: c.id ?? c.channel_id,
        channel_id: c.channel_id,
        channel_name: c.channel_name,
        is_group: c.is_group,
        last_message: c.last_message_content ?? null,
        last_message_at: c.last_message_at ?? null,
        unread_count: c.unread_count ?? 0,
        participants: (c.participants || []).map((p: any) => ({
          user_id: p.user_id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          email: p.email,
          online: p.online ?? false,
        })),
      }));

      if (!isMounted.current) return;

      console.log('[ChatSidebar] Fetched', mapped.length, 'conversations from server');
      storage.set(CACHE_KEYS.CONVERSATIONS, mapped, 300);
      setConversations(mapped);
      setError(null);

    } catch (err) {
      console.error('[ChatSidebar] Error fetching conversations:', err);
      if (!cachedData || forceRefresh) {
        setError("You don't have any chats yet.");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for new channel memberships (when user is added to new conversations)
  useRealtime({
    supabase,
    table: 'channel_members',
    filter: currentUserId ? `user_id=eq.${currentUserId}` : undefined,
    event: '*',
    onEvent: ({ eventType }) => {
      if (eventType === 'INSERT' && isMounted.current) {
        console.log('[ChatSidebar] New channel membership detected, refreshing conversations');
        hasFetched.current = false;
        fetchConversations(true);
      }
    }
  });

  // Listen for new messages to update conversation list
  useRealtimeInsert({
    supabase,
    table: 'messages',
    onInsert: (newMessage: any) => {
      if (!newMessage?.channel_id || !isMounted.current) return;
      
      console.log('[ChatSidebar] New message received, updating conversation:', newMessage.channel_id);
      
      setConversations(prev => {
        const idx = prev.findIndex(c => c.channel_id === newMessage.channel_id);
        if (idx === -1) {
          console.log('[ChatSidebar] Message for unknown channel, triggering refresh');
          // If we don't know about this channel, refresh the list
          setTimeout(() => fetchConversations(true), 1000);
          return prev;
        }
        
        const updated = [...prev];
        const conv = { ...updated[idx] };
        conv.last_message = newMessage.content;
        conv.last_message_at = newMessage.created_at;
        
        // Only increment unread if it's not from current user
        if (newMessage.sender_id !== currentUserId) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
        
        // Move conversation to top
        updated.splice(idx, 1);
        updated.unshift(conv);
        
        // Update cache
        storage.set(CACHE_KEYS.CONVERSATIONS, updated, 300);
        return updated;
      });
    }
  });

  // Add new conversation (from modal)
  const handleNewConversation = (conversation: Conversation) => {
    console.log('[ChatSidebar] Adding new conversation:', conversation);
    
    setConversations(prev => {
      const exists = prev.some(c => c.channel_id === conversation.channel_id);
      if (exists) return prev;
      
      const updated = [conversation, ...prev];
      storage.set(CACHE_KEYS.CONVERSATIONS, updated, 300);
      return updated;
    });
    
    // Select the new conversation
    onSelectChat(conversation);
    
    // Refresh to get latest server data
    setTimeout(() => fetchConversations(true), 1000);
  };

  // Remove conversation (when deleted)
  const handleConversationDeleted = (channelId: string) => {
    console.log('[ChatSidebar] Removing conversation:', channelId);
    
    setConversations(prev => {
      const updated = prev.filter(conv => conv.channel_id !== channelId);
      storage.set(CACHE_KEYS.CONVERSATIONS, updated, 300);
      return updated;
    });
    
    // Notify parent component
    if (onConversationDeleted) {
      onConversationDeleted(channelId);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat: Conversation) => {
    // Mark as read (reset unread count)
    setConversations(prev => {
      const updated = prev.map(c => 
        c.channel_id === chat.channel_id 
          ? { ...c, unread_count: 0 }
          : c
      );
      storage.set(CACHE_KEYS.CONVERSATIONS, updated, 300);
      return updated;
    });
    
    // Notify parent
    onSelectChat(chat);
  };

  // Handle search from search component
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle new chat button click
  const handleNewChatClick = () => {
    setIsModalOpen(true);
  };

  // Filter conversations based on search
  const filteredConversations = searchQuery
    ? conversations.filter(conv =>
        conv.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  // Format timestamp helper
  const formatTimestamp = (ts: string | null) =>
    ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : '';

  return (
    <div className={`h-full flex flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] shadow-[var(--shadow-sm)] ${className}`}>
      {/* Self-contained header component */}
      <ChatSidebarHeader 
        onNewChat={handleNewChatClick}
        title="My Chats"
      />
      
      {/* Self-contained search component */}
      <ChatSidebarSearch onSearchChange={handleSearchChange} />
      
      {error ? (
        <div className="p-4 text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--sidebar-accent))/0.3] rounded-[var(--radius)] m-2">
          <p className="mb-3">{error}</p>
          <button
            onClick={handleNewChatClick}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <ConversationList
          conversations={filteredConversations}
          isLoading={isLoading}
          searchQuery={searchQuery}
          selectedChat={selectedChat}
          onSelectChat={handleChatSelect}
          formatTimestamp={formatTimestamp}
        />
      )}
      
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationCreated={handleNewConversation}
      />
    </div>
  );
}