'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Users, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const isLoadingRef = useRef(false);
  const isMounted = useRef(true);
  
  // User profiles cache to solve the unknown user issue
  const [userProfiles, setUserProfiles] = useState({});

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 1️⃣ Load current user and mark Supabase as ready
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

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper function to get user profile from cache or participants
  const getUserProfile = (userId: string) => {
    // First check our user profiles cache
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }
    
    // Then try to find them in the participants list
    if (selectedChat && selectedChat.participants) {
      const participant = selectedChat.participants.find(p => p.user_id === userId);
      if (participant) {
        const profile = {
          id: participant.user_id,
          name: participant.display_name || 'User',
          avatar: participant.avatar_url || participant.display_name?.charAt(0)?.toUpperCase() || 'U',
          email: participant.email || ''
        };
        
        setUserProfiles(prev => ({
          ...prev,
          [userId]: profile
        }));
        
        return profile;
      }
    }
    
    return null;
  };

  // Add real-time listener for incoming messages
  useRealtimeInsert({
    supabase,
    table: 'messages',
    filter: selectedChat ? `channel_id=eq.${selectedChat.channel_id}` : undefined,
    onInsert: (newMsg) => {
      if (!isMounted.current) return;
      
      console.log('[Realtime] Processing new message in component:', newMsg);
      
      if (newMsg.sender_id !== currentUserId) {
        toast.success(`New message received!`);
      }
      
      const senderProfile = getUserProfile(newMsg.sender_id);
      
      const transformedMessage = {
        id: newMsg.id,
        content: newMsg.content,
        timestamp: newMsg.created_at || new Date().toISOString(),
        likes: 0,
        image: null,
        sender: {
          id: newMsg.sender_id,
          name: senderProfile?.name || newMsg.sender_name || 'Unknown User',
          avatar: senderProfile?.avatar || newMsg.sender_avatar || '', 
          email: senderProfile?.email || newMsg.sender_email || '',
        }
      };
      
      console.log('[Realtime] Adding message to state:', transformedMessage);
      setMessages(prev => {
        const tempIndex = prev.findIndex(msg => 
          msg.sender.id === newMsg.sender_id && 
          msg.content === newMsg.content && 
          String(msg.id).startsWith('temp-')
        );
        
        if (tempIndex >= 0) {
          console.log('[Realtime] Found matching temp message, replacing it');
          const newMessages = [...prev];
          newMessages[tempIndex] = transformedMessage;
          return newMessages;
        }
        
        if (prev.some(msg => msg.id === newMsg.id)) {
          console.log('[Realtime] Message already exists in state, skipping');
          return prev;
        }
        
        return [...prev, transformedMessage];
      });
      
      setTimeout(() => {
        if (isMounted.current && messagesEndRef.current) {
          console.log('[Realtime] Scrolling to bottom');
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    },
  });

  // Build user profile cache when selectedChat changes
  useEffect(() => {
    if (!selectedChat || !selectedChat.participants) return;
    
    console.log('[ChatPage] Building user profile cache from participants');
    
    const newCache = {};
    selectedChat.participants.forEach(participant => {
      newCache[participant.user_id] = {
        id: participant.user_id,
        name: participant.display_name || 'User',
        avatar: participant.avatar_url || participant.display_name?.charAt(0)?.toUpperCase() || 'U',
        email: participant.email || ''
      };
    });
    
    setUserProfiles(prev => ({
      ...prev,
      ...newCache
    }));
  }, [selectedChat]);

  // 2️⃣ Fetch messages on chat change
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
    
    console.log(`[ChatPage] Fetching messages for chat: ${selectedChat.channel_id}`);
    
    const fetchMessages = async () => {
      isLoadingRef.current = true;
      setLoadingMessages(true);
      
      try {
        console.log(`[ChatPage] Requesting messages from API: /api/messages/${selectedChat.channel_id}`);
        const res = await fetch(`/api/messages/${selectedChat.channel_id}`);
        
        if (!isMounted.current) return;
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[ChatPage] Failed to load messages: ${res.status}`, errorText);
          toast.error("Failed to load messages");
          return;
        }
        
        const messageData = await res.json();
        console.log(`[ChatPage] Received ${messageData.length} messages from API`);
        
        if (!isMounted.current) return;
        
        const sortedMessages = [...messageData].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        const newProfiles = {};
        sortedMessages.forEach(message => {
          if (message.sender && message.sender.id) {
            newProfiles[message.sender.id] = {
              id: message.sender.id,
              name: message.sender.name || 'User',
              avatar: message.sender.avatar || message.sender.name?.charAt(0)?.toUpperCase() || 'U',
              email: message.sender.email || ''
            };
          }
        });
        
        setUserProfiles(prev => ({
          ...prev,
          ...newProfiles
        }));
        
        setMessages(sortedMessages);
        
        setTimeout(() => {
          if (isMounted.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            console.log("[ChatPage] Scrolled to bottom after loading messages");
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
    };

    fetchMessages();
    
  }, [selectedChat?.channel_id]);

  // 3️⃣ Send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedChat || !currentUserId) {
      console.log("[ChatPage] Cannot send message - missing data:", { 
        hasMessage: !!messageText.trim(), 
        hasSelectedChat: !!selectedChat, 
        hasUser: !!currentUserId 
      });
      
      if (!messageText.trim()) {
        return;
      }
      
      toast.error("Cannot send message - please try again");
      return;
    }

    const messageContent = messageText.trim();
    setMessageText('');
    
    const userProfile = getUserProfile(currentUserId) || {
      id: currentUserId,
      name: 'You',
      avatar: '',
      email: ''
    };
    
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      content: messageContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      image: null,
      sender: {
        id: currentUserId,
        name: userProfile.name,
        avatar: userProfile.avatar,
        email: userProfile.email
      }
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    
    try {
      console.log(`[ChatPage] Sending message to channel ${selectedChat.channel_id}:`, messageContent);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: selectedChat.channel_id,
          sender_id: currentUserId,
          content: messageContent
        });

      if (error) {
        console.error('[ChatPage] Send error:', error);
        toast.error("Failed to send message");
        setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
      }
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err);
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
    }
  };

  // Handle chat selection - SIMPLIFIED
  const handleSelectChat = (chat: Conversation) => {
    console.log("[ChatPage] Selected new chat:", chat.channel_id);
    setSelectedChat(chat);
    // Close right sidebar when selecting new chat on mobile
    if (isMobile) {
      setShowRightSidebar(false);
    }
    toast.success(`Chat opened: ${chat.channel_name || 'New conversation'}`);
  };

  // Toggle right sidebar
  const toggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar);
  };

  // Resolve display name
  const resolvedName = selectedChat ? (
    selectedChat.channel_name ||
    (!selectedChat.is_group
      ? selectedChat.participants
          .filter((p) => p.user_id !== currentUserId)
          .map((p) => p.display_name)
          .join(', ')
      : 'Unnamed Group')
  ) : '';

  // Map participants for right sidebar
  const sidebarParticipants = selectedChat ? selectedChat.participants.map((p) => ({
    id:     p.user_id,
    name:   p.display_name,
    avatar: p.avatar_url,
    email:  p.email,
    online: p.online,
  })) : [];

  return (
    <div className="chat-container">
      {/* Left Sidebar - Always visible, responsive sizing */}
      <ChatSidebar
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        className="chat-sidebar"
      />

      {/* Main Content Area */}
      <div className="chat-content">
        {selectedChat ? (
          <>
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
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Right Sidebar */}
      {selectedChat && (
        <>
          {/* Mobile overlay */}
          {isMobile && showRightSidebar && (
            <div 
              className="right-sidebar-overlay"
              onClick={() => setShowRightSidebar(false)}
            />
          )}
          
          <div className={`chat-right-sidebar ${showRightSidebar ? 'mobile-visible' : ''}`}>
            <ChatRightSidebar
              selectedChatName={resolvedName}
              participants={sidebarParticipants}
              avatarColors={avatarColors}
              isGroup={selectedChat.is_group}
              onClose={() => setShowRightSidebar(false)}
            />
          </div>
        </>
      )}

      {/* Right Sidebar Toggle Button - Only show on mobile when chat is selected */}
      {selectedChat && (
        <button
          onClick={toggleRightSidebar}
          className={`chat-right-sidebar-toggle ${selectedChat ? 'show' : ''}`}
          aria-label="Toggle chat info"
        >
          <Users size={20} />
        </button>
      )}
    </div>
  );
}

// Welcome screen when no chat is selected
function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 mx-auto mb-6 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center">
          <MessageSquare size={32} className="text-[hsl(var(--muted-foreground))]" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-3 text-[hsl(var(--foreground))]">
          Welcome to Messages
        </h2>
        
        <p className="text-[hsl(var(--muted-foreground))] mb-6">
          Select a conversation from the sidebar to start chatting, or create a new conversation to get started.
        </p>
        
        <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
            <span>Start direct messages with team members</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
            <span>Create group conversations</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
            <span>Share files and images</span>
          </div>
        </div>
      </div>
    </div>
  );
}