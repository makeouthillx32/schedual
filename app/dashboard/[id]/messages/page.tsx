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
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      const res = await fetch(`/api/messages/${selectedChat.id}`);
      if (!res.ok) return console.error('Failed to load messages');
      setMessages(await res.json());
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Auto-hide sidebar on mobile when a chat is selected
      if (isMobile) {
        setShowSidebar(false);
      }
    })();
  }, [selectedChat, isMobile]);

  // 3️⃣ Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !currentUserId) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: selectedChat.id,
        sender_id:  currentUserId,
        content:    messageText.trim(),
      });

    if (error) console.error('Send error:', error.message);
    else setMessageText('');
  };

  // Handle chat selection with sidebar toggle
  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowSidebar(false);
    }
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