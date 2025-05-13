// Updated Chat Page with fixed realtime functionality
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

  // Add real-time listener for incoming messages - FIXED
  useRealtimeInsert({
    table: 'messages',
    filter: selectedChat ? `channel_id=eq.${selectedChat.id}` : undefined,
    onInsert: (newMsg: any) => {
      console.log('[Realtime] Processing new message:', newMsg);
      
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
      setMessages(prev => [...prev, transformedMessage]);
      
      // Scroll to bottom after a tiny delay to ensure DOM update
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
  });
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 1️⃣ Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setCurrentUserId(data.user.id);
    });
  }, []);

  // 2️⃣ Fetch messages on chat change
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    
    (async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/${selectedChat.id}`);
        if (!res.ok) {
          console.error('Failed to load messages', await res.text());
          return;
        }
        const messageData = await res.json();
        setMessages(messageData);
        
        // Scroll to bottom after a tiny delay to ensure DOM update
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
   
      // Auto-hide sidebar on mobile when a chat is selected
      if (isMobile) {
        setShowSidebar(false);
      }
    })();
  }, [selectedChat, isMobile]);

  // 3️⃣ Send new message (optimistic append)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !currentUserId) return;

    console.log('Sending message to channel:', selectedChat.id);
    
    // Insert & return the new message
    const { data, error } = await supabase
      .from('messages')
      .insert(
        {
          channel_id: selectedChat.id,
          sender_id:  currentUserId,
          content:    messageText.trim(),
        },
        { returning: 'representation' }
      );

    if (error) {
      console.error('Send error:', error.message);
    } else {
      console.log('Message sent successfully:', data);
      
      // Clear input regardless of whether we add the message to state
      // (realtime subscription should handle it)
      setMessageText('');
    }
  };

  // Handle chat selection with sidebar toggle
  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    if (isMobile) setShowSidebar(false);
  };


  // 4️⃣ If no chat selected, show prompt or sidebar on mobile
  if (!selectedChat) {
    return (
      <div className="chat-container">
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
        
        {isMobile && (
          <button 
            className="chat-sidebar-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
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
      {/* Mobile sidebar toggle button */}
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