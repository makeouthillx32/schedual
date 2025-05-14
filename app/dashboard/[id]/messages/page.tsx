'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Menu, X } from 'lucide-react';
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages, { Message } from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';
import './_components/mobile.scss';
import LoadingSVG from '@/app/_components/_events/loading-page';
import { useRealtimeInsert } from '@/hooks/useRealtimeInsert';

// Create Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Avatar colors for initials
const avatarColors = { AL: 'bg-blue-500', JA: 'bg-orange-500', JE: 'bg-green-500' };

export default function ChatPage() {
  // State management
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) return console.error("[ChatPage] Auth error:", error);
      if (data?.user?.id) setCurrentUserId(data.user.id);
    });
  }, []);

  // Listen for incoming messages
  useRealtimeInsert({
    supabase,
    table: 'messages',
    filter: selectedChat ? `channel_id=eq.${selectedChat.id}` : undefined,
    onInsert: (newMsg) => {
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
        if (prev.some(msg => msg.id === newMsg.id)) return prev;
        return [...prev, transformedMessage];
      });
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
  });
  
  // Handle screen resizes
  useEffect(() => {
    const checkScreenSize = () => {
      const newIsMobile = window.innerWidth < 768;
      const newIsDesktopView = window.innerWidth >= 1024;
      
      const container = document.querySelector('.chat-container');
      if (container) container.classList.add('resize-transition');
      
      if (isDesktopView && !newIsDesktopView && showRightSidebar) {
        setShowRightSidebar(false);
      }
      
      setIsMobile(newIsMobile);
      setIsDesktopView(newIsDesktopView);
      
      if (!isDesktopView && !newIsDesktopView) {
        setShowSidebar(window.innerWidth >= 768);
      }
      
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        if (container) container.classList.remove('resize-transition');
      }, 100);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [isDesktopView, showRightSidebar]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/${selectedChat.id}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to load messages: ${res.status}`, errorText);
          return;
        }
        
        const messageData = await res.json();
        const sortedMessages = [...messageData].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(sortedMessages);
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
   
      if (isMobile) setShowSidebar(false);
    };

    fetchMessages();
  }, [selectedChat, isMobile]);

  // Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !currentUserId) return;

    const messageContent = messageText.trim();
    
    // Optimistic update
    const optimisticMessage: Message = {
      id: Date.now(),
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    
    // Send to server
    try {
      await supabase.from('messages').insert({
        channel_id: selectedChat.id,
        sender_id: currentUserId,
        content: messageContent,
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    if (isMobile) setShowSidebar(false);
  };

  // Toggle right sidebar
  const toggleRightSidebar = () => {
    setShowRightSidebar(prev => !prev);
  };

  // Resolve chat name
  const resolvedName = selectedChat?.name || 
    (!selectedChat?.is_group && selectedChat?.participants
      ? selectedChat.participants
          .filter(p => p.user_id !== currentUserId)
          .map(p => p.display_name)
          .join(', ')
      : 'Unnamed Group');

  // Map participants for sidebar
  const sidebarParticipants = selectedChat?.participants.map(p => ({
    id: p.user_id,
    name: p.display_name,
    avatar: p.avatar_url,
    email: p.email,
    online: p.online,
  })) || [];

  // Render no chat selected state
  if (!selectedChat) {
    return (
      <div className="chat-container">
        {isMobile && (
          <button className="chat-sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        
        <div className={`chat-sidebar ${!showSidebar && isMobile ? 'hidden-mobile' : ''}`}>
          <ChatSidebar selectedChat={null} onSelectChat={handleSelectChat} />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {isMobile && !showSidebar ? (
            <div className="text-center p-4">
              <button onClick={() => setShowSidebar(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
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

  // Main chat view
  return (
    <div className="chat-container">
      {isMobile && (
        <button className="chat-sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      
      <div className={`chat-sidebar ${!showSidebar && isMobile ? 'hidden-mobile' : ''}`}>
        <ChatSidebar selectedChat={selectedChat} onSelectChat={handleSelectChat} />
      </div>

      <div className="chat-content">
        <ChatHeader
          name={resolvedName}
          timestamp={selectedChat.last_message_at || ''}
          isGroup={selectedChat.is_group}
          currentUserId={currentUserId || ''}
          onInfoClick={toggleRightSidebar}
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

<<<<<<< HEAD
      {/* Mobile overlay for right sidebar - use higher z-index */}
      {showRightSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setShowRightSidebar(false)}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Right sidebar with inline styles to ensure it's visible */}
      <div 
        className={showRightSidebar ? 'mobile-right-sidebar-open' : 'mobile-right-sidebar-closed'}
=======
      {/* Mobile overlay for right sidebar */}
      {showRightSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50" 
          onClick={() => setShowRightSidebar(false)}
          style={{ 
            touchAction: 'none', 
            zIndex: 9998 
          }}
        />
      )}

      {/* Right sidebar with improved visibility */}
      <div 
>>>>>>> ff8dc22aa7df32d6b8bb5010e3242067fbda3936
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '80%',
          maxWidth: '300px',
<<<<<<< HEAD
          height: '100%',
          backgroundColor: 'var(--app-card, #ffffff)',
          zIndex: 50,
=======
          height: '100vh',
          backgroundColor: 'var(--app-card, #ffffff)',
          zIndex: 9999,
>>>>>>> ff8dc22aa7df32d6b8bb5010e3242067fbda3936
          boxShadow: '-2px 0 10px rgba(0,0,0,0.2)',
          transform: showRightSidebar ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
<<<<<<< HEAD
        {showRightSidebar && (
          <ChatRightSidebar
            selectedChatName={resolvedName}
            participants={sidebarParticipants}
            avatarColors={avatarColors}
            isGroup={selectedChat.is_group}
            onClose={() => setShowRightSidebar(false)}
          />
=======
        {/* Always visible close button */}
        {showRightSidebar && (
          <button
            onClick={() => setShowRightSidebar(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10000,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              touchAction: 'manipulation'
            }}
          >
            <X size={20} />
          </button>
        )}
        
        {/* Render sidebar content with padding for close button */}
        {showRightSidebar && (
          <div style={{ paddingTop: '40px', height: '100%', overflow: 'auto' }}>
            <ChatRightSidebar
              selectedChatName={resolvedName}
              participants={sidebarParticipants}
              avatarColors={avatarColors}
              isGroup={selectedChat.is_group}
              onClose={() => setShowRightSidebar(false)}
            />
          </div>
>>>>>>> ff8dc22aa7df32d6b8bb5010e3242067fbda3936
        )}
      </div>
    </div>
  );
}