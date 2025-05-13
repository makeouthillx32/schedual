'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Menu, X } from 'lucide-react';
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages, { Message } from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';
import './_components/mobile.scss'; // Import our new SCSS file
import LoadingSVG from '@/app/_components/_events/loading-page';
import { useRealtimeInsert } from '@/hooks/useRealtimeInsert'; // top of file

// Create a single shared Supabase client instance
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Avatar‐initial color map (used when no URL)
const avatarColors: Record<string, string> = {
  AL: 'bg-blue-500',
  JA: 'bg-orange-500',
  JE: 'bg-green-500',
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // 1️⃣ Load current user and mark Supabase as ready
  useEffect(() => {
    console.log("[ChatPage] Initializing and fetching current user");
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("[ChatPage] Auth error:", error);
        return;
      }
      
      if (data.user?.id) {
        console.log("[ChatPage] User authenticated:", data.user.id);
        setCurrentUserId(data.user.id);
      } else {
        console.log("[ChatPage] No authenticated user found");
      }
      
      // Mark supabase as ready for realtime
      setSupabaseReady(true);
      console.log("[ChatPage] Supabase client ready for realtime");
    });
  }, []);

  // Add real-time listener for incoming messages with shared Supabase client
  useRealtimeInsert({
    supabase, // Pass the shared client
    table: 'messages',
    filter: selectedChat ? `channel_id=eq.${selectedChat.id}` : undefined,
    onInsert: (newMsg: any) => {
      console.log('[Realtime] Processing new message in component:', newMsg);
      
      // Transform the raw message into the expected Message format
      const transformedMessage: Message = {
        id: newMsg.id,
        content: newMsg.content,
        timestamp: newMsg.created_at || new Date().toISOString(),
        likes: 0,
        image: null,
        sender: {
          id: newMsg.sender_id,
          name: newMsg.sender_name || 'Unknown User',
          avatar: newMsg.sender_avatar || '',
          email: newMsg.sender_email || '',
        }
      };
      
      console.log('[Realtime] Adding message to state:', transformedMessage);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.some(msg => msg.id === newMsg.id)) {
          console.log('[Realtime] Message already exists in state, skipping');
          return prev;
        }
        // Append message to end of array
        return [...prev, transformedMessage];
      });
      
      // Scroll to bottom after a tiny delay to ensure DOM update
      setTimeout(() => {
        console.log('[Realtime] Scrolling to bottom');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
  });
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Initialize sidebar visibility based on device
      setShowSidebar(window.innerWidth >= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 2️⃣ Fetch messages on chat change
  useEffect(() => {
    if (!selectedChat) {
      console.log("[ChatPage] No chat selected, clearing messages");
      setMessages([]);
      return;
    }
    
    console.log(`[ChatPage] Fetching messages for chat: ${selectedChat.id}`);
    
    (async () => {
      setLoadingMessages(true);
      try {
        console.log(`[ChatPage] Requesting messages from API: /api/messages/${selectedChat.id}`);
        const res = await fetch(`/api/messages/${selectedChat.id}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[ChatPage] Failed to load messages: ${res.status}`, errorText);
          return;
        }
        
        const messageData = await res.json();
        console.log(`[ChatPage] Received ${messageData.length} messages from API`);
        
        // Sort messages to ensure chronological order (oldest first)
        const sortedMessages = [...messageData].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(sortedMessages);
        
        // Scroll to bottom after a tiny delay to ensure DOM update
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          console.log("[ChatPage] Scrolled to bottom after loading messages");
        }, 50);
      } catch (err) {
        console.error('[ChatPage] Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
   
      // Keep sidebar visible on mobile when a chat is selected
      if (isMobile) {
        setShowSidebar(false);
      }
    })();
  }, [selectedChat, isMobile]);

  // 3️⃣ Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !currentUserId) {
      console.log("[ChatPage] Cannot send message - missing data:", { 
        hasMessage: !!messageText.trim(), 
        hasSelectedChat: !!selectedChat, 
        hasUser: !!currentUserId 
      });
      return;
    }

    const messageContent = messageText.trim();
    console.log(`[ChatPage] Sending message to channel ${selectedChat.id}:`, messageContent);
    
    // Optimistically add message to state for immediate feedback
    const optimisticMessage: Message = {
      id: Date.now(), // Temporary ID
      content: messageContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      image: null,
      sender: {
        id: currentUserId,
        name: 'You', // Placeholder, will be replaced by server data
        avatar: '',
        email: '',
      }
    };
    
    console.log("[ChatPage] Adding optimistic message:", optimisticMessage);
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageText(''); // Clear input right away
    
    // Scroll to bottom after optimistic update
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    
    // Now send to server
    try {
      console.log("[ChatPage] Sending message to Supabase");
      const { data, error } = await supabase
        .from('messages')
        .insert(
          {
            channel_id: selectedChat.id,
            sender_id:  currentUserId,
            content:    messageContent,
          },
          { returning: 'representation' }
        );

      if (error) {
        console.error('[ChatPage] Send error:', error);
        // Could add error handling UI here
      } else {
        console.log('[ChatPage] Message sent successfully:', data);
        // The real message will come through the realtime subscription
      }
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err);
    }
  };

  // Handle chat selection with sidebar toggle
  const handleSelectChat = (chat: Conversation) => {
    console.log("[ChatPage] Selected new chat:", chat.id);
    setSelectedChat(chat);
    // Keep sidebar visible on desktop, hide on mobile when chat selected
    if (isMobile) setShowSidebar(false);
  };


  // 4️⃣ If no chat selected, show prompt or sidebar on mobile
  if (!selectedChat) {
    return (
      <div className="chat-container">
        {/* Mobile sidebar toggle button - always visible */}
        {isMobile && (
          <button 
            className="chat-sidebar-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        
        <div className={`chat-sidebar ${!showSidebar && isMobile ? 'hidden-mobile' : ''}`}>
          <ChatSidebar 
            selectedChat={null} 
            onSelectChat={handleSelectChat} 
          />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {isMobile && !showSidebar ? (
            <div className="text-center p-4">
              <button 
                onClick={() => setShowSidebar(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Select a conversation
              </button>
            </div>
          ) : !isMobile && (
            <h2>Select a conversation</h2>
          )}
        </div>
      </div>
    );
  }

  // 5️⃣ Resolve display name
  const resolvedName =
    selectedChat.name ||
    (!selectedChat.is_group
      ? selectedChat.participants
          .filter((p) => p.user_id !== currentUserId)
          .map((p) => p.display_name)
          .join(', ')
      : 'Unnamed Group');

  // 6️⃣ Map participants into ChatRightSidebar's shape
  const sidebarParticipants = selectedChat.participants.map((p) => ({
    id:     p.user_id,
    name:   p.display_name,
    avatar: p.avatar_url,
    email:  p.email,
    online: p.online,
  }));

  return (
    <div className="chat-container">
      {/* Mobile sidebar toggle button - always visible */}
      {isMobile && (
        <button 
          className="chat-sidebar-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      
      {/* Sidebar with responsive visibility */}
      <div className={`chat-sidebar ${!showSidebar && isMobile ? 'hidden-mobile' : ''}`}>
        <ChatSidebar 
          selectedChat={selectedChat} 
          onSelectChat={handleSelectChat} 
        />
      </div>

      <div className="chat-content">
        <ChatHeader
          name={resolvedName}
          timestamp={selectedChat.last_message_at || ''}
          isGroup={selectedChat.is_group}
          currentUserId={currentUserId || ''}
          onInfoClick={() => setShowRightSidebar(!showRightSidebar)}
        />
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSVG />
          </div>
          ) : (
            <>
            <ChatMessages
              messages={messages}
              currentUserId={currentUserId!}
              messagesEndRef={messagesEndRef}
              avatarColors={avatarColors}
            />
            <MessageInput
              message={messageText}
              onSetMessage={setMessageText}
              handleSendMessage={handleSendMessage}
            />
          </>
        )}
      </div>

      {/* Right sidebar with mobile drawer behavior */}
      <div className={`chat-right-sidebar ${showRightSidebar ? 'open' : ''}`}>
        <ChatRightSidebar
          selectedChatName={resolvedName}
          participants={sidebarParticipants}
          avatarColors={avatarColors}
          isGroup={selectedChat.is_group}
          onClose={() => setShowRightSidebar(false)}
        />
      </div>
    </div>
  );
}