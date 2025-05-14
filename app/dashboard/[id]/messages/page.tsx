'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Menu, X } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Add toast for notifications
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';
import './_components/mobile.scss';
import LoadingSVG from '@/app/_components/_events/loading-page';
import { useRealtimeInsert } from '@/hooks/useRealtimeInsert';

// Create a single shared Supabase client instance
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Avatar-initial color map (used when no URL)
const avatarColors = {
  AL: 'bg-blue-500',
  JA: 'bg-orange-500',
  JE: 'bg-green-500',
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const isLoadingRef = useRef(false);
  const isMounted = useRef(true);

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load current user and mark Supabase as ready
  useEffect(() => {
    console.log("[ChatPage] Initializing and fetching current user");
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted.current) return;
      
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
      
      setSupabaseReady(true);
      console.log("[ChatPage] Supabase client ready for realtime");
    });

    return () => { isMounted.current = false; };
  }, []);

  // Add real-time listener for incoming messages
  useRealtimeInsert({
    supabase,
    table: 'messages',
    filter: selectedChat ? `channel_id=eq.${selectedChat.id}` : undefined,
    onInsert: (newMsg) => {
      if (!isMounted.current) return;
      
      console.log('[Realtime] Processing new message:', newMsg);
      
      // Show notification if message isn't from current user
      if (newMsg.sender_id !== currentUserId) {
        const senderName = newMsg.sender_name || 'Someone';
        toast.success(`New message from ${senderName}`);
      }
      
      // Transform the raw message
      const transformedMessage = {
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
      
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMsg.id)) {
          console.log('[Realtime] Message already exists, skipping');
          return prev;
        }
        return [...prev, transformedMessage];
      });
      
      // Scroll to bottom
      setTimeout(() => {
        if (isMounted.current && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    },
  });

  // Fetch messages on chat change
  useEffect(() => {
    if (!selectedChat) {
      console.log("[ChatPage] No chat selected, clearing messages");
      setMessages([]);
      return;
    }
    
    if (isLoadingRef.current) {
      console.log("[ChatPage] Already loading messages, skipping");
      return;
    }
    
    console.log(`[ChatPage] Fetching messages for chat: ${selectedChat.id}`);
    
    const fetchMessages = async () => {
      isLoadingRef.current = true;
      setLoadingMessages(true);
      
      try {
        const res = await fetch(`/api/messages/${selectedChat.id}`);
        
        if (!isMounted.current) return;
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[ChatPage] Load error: ${res.status}`, errorText);
          toast.error("Failed to load messages");
          return;
        }
        
        const messageData = await res.json();
        console.log(`[ChatPage] Received ${messageData.length} messages`);
        
        if (!isMounted.current) return;
        
        // Sort messages (oldest first)
        const sortedMessages = [...messageData].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(sortedMessages);
        
        setTimeout(() => {
          if (isMounted.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } catch (err) {
        console.error('[ChatPage] Error fetching messages:', err);
        toast.error("Failed to load messages");
      } finally {
        if (isMounted.current) {
          setLoadingMessages(false);
          isLoadingRef.current = false;
        }
      }
   
      if (isMobile) {
        setShowSidebar(false);
      }
    };

    fetchMessages();
  }, [selectedChat?.id, isMobile]);

  // Send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !currentUserId) {
      console.log("[ChatPage] Cannot send message - missing data");
      return;
    }

    const messageContent = messageText.trim();
    console.log(`[ChatPage] Sending message: ${messageContent}`);
    
    // Add optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      image: null,
      sender: {
        id: currentUserId,
        name: 'You',
        avatar: '',
        email: '',
      }
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageText('');
    
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          channel_id: selectedChat.id,
          sender_id: currentUserId,
          content: messageContent,
        }]);

      if (error) {
        console.error('[ChatPage] Send error:', error);
        toast.error("Failed to send message");
        
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      } else {
        toast.success("Message sent!");
      }
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err);
      toast.error("Failed to send message");
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    console.log("[ChatPage] Selected new chat:", chat.id);
    setSelectedChat(chat);
    if (isMobile) setShowSidebar(false);
    toast.success(`Opened chat with ${chat.channel_name || 'User'}`);
  };

  // If no chat selected, show prompt or sidebar
  if (!selectedChat) {
    return (
      <div className="chat-container">
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

  // Resolve display name
  const resolvedName =
    selectedChat.channel_name ||
    (!selectedChat.is_group
      ? selectedChat.participants
          .filter((p) => p.user_id !== currentUserId)
          .map((p) => p.display_name)
          .join(', ')
      : 'Unnamed Group');

  // Map participants for right sidebar
  const sidebarParticipants = selectedChat.participants.map((p) => ({
    id: p.user_id,
    name: p.display_name,
    avatar: p.avatar_url,
    email: p.email,
    online: p.online,
  }));

  return (
    <div className="chat-container">
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
              currentUserId={currentUserId}
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