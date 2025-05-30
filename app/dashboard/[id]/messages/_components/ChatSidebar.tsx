// app/dashboard/[id]/messages/_components/ChatSidebar.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import NewChatModal from './NewChatModal';
import ChatSidebarHeader from './ChatSidebarHeader';
import ChatSidebarSearch from './ChatSidebarSearch';
import ConversationList from './ConversationList';
import { formatDistanceToNow } from 'date-fns';
import { storage, CACHE_KEYS } from '@/lib/cookieUtils';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtime, useRealtimeInsert } from '@/hooks/useRealtimeInsert';
import './ChatSidebar.scss';

export interface Participant {
  user_id:      string;
  display_name: string;
  avatar_url:   string;
  email:        string;
  online:       boolean;
}

export interface Conversation {
  id:              string;
  channel_id:      string;
  channel_name:    string;
  is_group:        boolean;
  last_message:    string | null;
  last_message_at: string | null;
  unread_count:    number;
  participants:    Participant[];
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const hasFetched = useRef(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const cachedUser = storage.get(CACHE_KEYS.CURRENT_USER);
    if (cachedUser?.id) {
      setCurrentUserId(cachedUser.id);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted.current) return;
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
        storage.set(CACHE_KEYS.CURRENT_USER, data.user, 3600);
      }
    });
  }, []);
  
  useRealtime({
    supabase,
    table: 'channel_members',
    filter: currentUserId ? `user_id=eq.${currentUserId}` : undefined,
    event: '*',
    onEvent: ({ new: newMember }) => {
      if (newMember && isMounted.current) {
        hasFetched.current = false;
        fetchConversations(true);
      }
    }
  });
  
  useRealtimeInsert({
    supabase,
    table: 'messages',
    onInsert: (newMessage) => {
      if (!newMessage?.channel_id || !isMounted.current) return;
      setConversations(prev => {
        const idx = prev.findIndex(c => c.channel_id === newMessage.channel_id);
        if (idx === -1) return prev;
        const updated = [...prev];
        const conv = { ...updated[idx] };
        conv.last_message = newMessage.content;
        conv.last_message_at = newMessage.created_at;
        if (newMessage.sender_id !== currentUserId) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
        updated.splice(idx, 1);
        updated.unshift(conv);
        storage.set(CACHE_KEYS.CONVERSATIONS, updated, 300);
        return updated;
      });
    }
  });
  
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
      
      const res = await fetch('/api/messages/get-conversations');
      if (!isMounted.current) return;
      if (!res.ok) throw new Error('Failed to fetch conversations');
      
      const raw = await res.json();
      const mapped: Conversation[] = raw.map((c: any) => ({
        id:              c.id ?? c.channel_id,
        channel_id:      c.channel_id,
        channel_name:    c.channel_name,
        is_group:        c.is_group,
        last_message:    c.last_message_content ?? null,
        last_message_at: c.last_message_at ?? null,
        unread_count:    c.unread_count ?? 0,
        participants:    (c.participants || []).map((p: any) => ({
          user_id:      p.user_id,
          display_name: p.display_name,
          avatar_url:   p.avatar_url,
          email:        p.email,
          online:       p.online ?? false,
        })),
      }));
      
      if (!isMounted.current) return;
      storage.set(CACHE_KEYS.CONVERSATIONS, mapped, 300);
      setConversations(mapped);
      setError(null);
      
    } catch (err) {
      if (!cachedData || forceRefresh) {
        setError("You don't have any chats yet.");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };
  
  useEffect(() => { 
    fetchConversations(); 
  }, []);
  
  const formatTimestamp = (ts: string | null) =>
    ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : '';

  const handleChatSelect = (chat: Conversation) => {
    onSelectChat(chat);
  };

  const handleNewConversation = (conversation: Conversation) => {
    // Add new conversation to the list and select it
    setConversations(prev => [conversation, ...prev]);
    onSelectChat(conversation);
  };

  // Handle conversation deletion
  const handleConversationDeleted = (channelId: string) => {
    console.log('[ChatSidebar] Removing deleted conversation:', channelId);
    
    setConversations(prev => {
      const updated = prev.filter(conv => conv.channel_id !== channelId);
      // Update cache
      storage.set(CACHE_KEYS.CONVERSATIONS, updated, 300);
      return updated;
    });
    
    // If parent provided a callback, call it too
    if (onConversationDeleted) {
      onConversationDeleted(channelId);
    }
  };
  
  return (
    <div className={`h-full flex flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] shadow-[var(--shadow-sm)] ${className}`}>
      <ChatSidebarHeader onNewChat={() => setIsModalOpen(true)} />
      <ChatSidebarSearch
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      {error ? (
        <div className="p-4 text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--sidebar-accent))/0.3] rounded-[var(--radius)] m-2">
          <p className="mb-3">{error}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
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