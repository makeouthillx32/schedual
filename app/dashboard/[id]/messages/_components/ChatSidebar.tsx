// _components/ChatSidebar.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { PlusCircle, Search, X } from 'lucide-react';
import NewChatModal from './NewChatModal';
import { formatDistanceToNow } from 'date-fns';
import { storage, CACHE_KEYS } from '@/lib/cookieUtils';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtimeInsert } from '@/hooks/useRealtimeInsert';
import { useRealtime } from '@/hooks/useRealtimeInsert';
import './mobile.scss';

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
}

export default function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Track mount status and last fetch time
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const hasFetched = useRef(false);
  
  // Create Supabase client for real-time subscriptions
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      isMounted.current = false;
    };
  }, []);
  
  // Get current user ID
  useEffect(() => {
    // Try to get from cache first
    const cachedUser = storage.get(CACHE_KEYS.CURRENT_USER);
    if (cachedUser?.id) {
      setCurrentUserId(cachedUser.id);
      return;
    }
    
    // If not in cache, get from auth
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted.current) return;
      
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
        storage.set(CACHE_KEYS.CURRENT_USER, data.user, 3600); // Cache for 1 hour
      }
    });
  }, []);
  
  // Monitor channel_members table for any changes involving the current user
  useRealtime<any>({
    supabase,
    table: 'channel_members',
    // Filter to only show changes for the current user
    filter: currentUserId ? `user_id=eq.${currentUserId}` : undefined,
    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
    onEvent: ({ new: newMember, eventType }) => {
      console.log(`[ChatSidebar] Channel member event: ${eventType}`, newMember);
      
      // If we have a new membership or an update, refresh conversations
      if (newMember && isMounted.current) {
        console.log('[ChatSidebar] User added to or updated in a channel, refreshing conversations');
        // Force refresh conversations
        hasFetched.current = false;
        fetchConversations(true);
      }
    }
  });
  
  // Monitor messages table for updates to last messages
  useRealtimeInsert<any>({
    supabase,
    table: 'messages',
    // No specific filter, we'll check if it affects our conversations in the handler
    onInsert: (newMessage) => {
      if (!newMessage?.channel_id || !isMounted.current) return;
      
      console.log('[ChatSidebar] New message in channel:', newMessage.channel_id);
      
      // Update the conversation with the new message
      setConversations(prevConversations => {
        // Find the conversation that this message belongs to
        const conversationIndex = prevConversations.findIndex(
          c => c.channel_id === newMessage.channel_id
        );
        
        // If conversation not found, no update needed
        if (conversationIndex === -1) return prevConversations;
        
        // Create a copy of conversations
        const updatedConversations = [...prevConversations];
        const conversation = { ...updatedConversations[conversationIndex] };
        
        // Update with new message details
        conversation.last_message = newMessage.content;
        conversation.last_message_at = newMessage.created_at;
        
        // If message is not from current user, increment unread count
        if (newMessage.sender_id !== currentUserId) {
          conversation.unread_count = (conversation.unread_count || 0) + 1;
        }
        
        // Move this conversation to the top of the list
        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(conversation);
        
        // Update cache
        storage.set(CACHE_KEYS.CONVERSATIONS, updatedConversations, 300);
        
        return updatedConversations;
      });
    }
  });

  // Fetch conversations from API
  const fetchConversations = async (forceRefresh = false) => {
    // Skip redundant fetches unless forced
    if (!forceRefresh && hasFetched.current && Date.now() - lastFetchTime.current < 30000) {
      console.log("[ChatSidebar] Skipping redundant fetch, using cached data");
      return;
    }
    
    // Try to use cached data first
    const cachedData = storage.get(CACHE_KEYS.CONVERSATIONS);
    if (!forceRefresh && cachedData && !hasFetched.current) {
      console.log("[ChatSidebar] Using cached conversations");
      setConversations(cachedData);
      setIsLoading(false);
      
      // Auto-select first chat if none selected
      if (cachedData.length > 0 && !selectedChat) {
        onSelectChat(cachedData[0]);
      }
    }
    
    // Fetch from API regardless to ensure fresh data
    try {
      // Mark as fetched to prevent redundant calls
      hasFetched.current = true;
      lastFetchTime.current = Date.now();
      
      if (!cachedData || forceRefresh) {
        setIsLoading(true);
      }
      
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
      
      // Cache the conversations
      storage.set(CACHE_KEYS.CONVERSATIONS, mapped, 300); // 5 minute cache
      
      setConversations(mapped);
      setError(null);
      
      // Auto-select first chat if none selected
      if (mapped.length > 0 && !selectedChat) {
        onSelectChat(mapped[0]);
      }
    } catch (err) {
      console.error("[ChatSidebar] Error fetching conversations:", err);
      if (!cachedData || forceRefresh) {
        setError("You don't have any chats yet.");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [selectedChat, onSelectChat]);

  const formatTimestamp = (ts: string | null) =>
    ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : '';

  // Filter conversations by search query
  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.channel_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-3 flex justify-between items-center border-b">
          <h1 className="font-semibold text-lg">My Chats</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 bg-blue-500 rounded-full text-white flex items-center justify-center"
            title="New chat"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-2 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-pulse flex justify-center items-center">
                <div className="h-2 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-gray-400">{error}</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? 'No matching chats' : 'No chats yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              // Determine if this conversation is selected
              const isSelected = selectedChat?.id === conv.id;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectChat(conv)}
                  className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isSelected
                      ? 'bg-gray-200 dark:bg-gray-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                      <span>{conv.channel_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">
                          {conv.channel_name}
                        </span>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">
                            {formatTimestamp(conv.last_message_at).replace(/about|less than/, '')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500 truncate">
                          {conv.last_message ?? 'No messages yet'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationCreated={onSelectChat}
      />
    </>
  );
}