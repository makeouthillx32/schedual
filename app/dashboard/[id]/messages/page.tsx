'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Menu, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import './_components/mobile.scss';
import LoadingSVG from '@/app/_components/_events/loading-page';
import { useRealtimeInsert } from '@/hooks/useRealtimeInsert';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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

  const getUserProfile = (userId) => {
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }
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

  useRealtimeInsert({
    supabase,
    table: 'messages',
    filter: selectedChat ? `channel_id=eq.${selectedChat.id}` : undefined,
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
        console.log(`[ChatPage] Requesting messages from API: /api/messages/${selectedChat.id}`);
        const res = await fetch(`/api/messages/${selectedChat.id}`);
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
  }, [selectedChat?.id]);

  const handleSendMessage = async (e, attachments = null) => {
    e.preventDefault();
    if (!messageText.trim() && !attachments?.length || !selectedChat || !currentUserId) {
      console.log("[ChatPage] Cannot send message - missing data:", { 
        hasMessage: !!messageText.trim(), 
        hasAttachments: !!attachments?.length,
        hasSelectedChat: !!selectedChat, 
        hasUser: !!currentUserId 
      });
      if (!messageText.trim() && !attachments?.length) {
        return;
      }
      toast.error("Cannot send message - please try again");
      return;
    }
    const messageContent = messageText.trim() || '';
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
      image: attachments?.find(a => a.type === 'image')?.url || null,
      attachments: attachments || [],
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
      console.log(`[ChatPage] Sending message to channel ${selectedChat.id}:`, messageContent);
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          channel_id: selectedChat.id,
          sender_id: currentUserId,
          content: messageContent
        })
        .select('id')
        .single();
      if (messageError) {
        console.error('[ChatPage] Message send error:', messageError);
        toast.error("Failed to send message");
        setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
        return;
      }
      if (attachments?.length > 0) {
        const attachmentInserts = attachments.map(attachment => ({
          message_id: messageData.id,
          file_url: attachment.url,
          file_type: attachment.type,
          file_name: attachment.name,
          file_size: attachment.size
        }));
        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert(attachmentInserts);
        if (attachmentError) {
          console.error('[ChatPage] Attachment save error:', attachmentError);
          toast.error("Message sent but attachments failed to save");
        } else {
          toast.success(`Message sent with ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}!`);
        }
      }
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err);
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
    }
  };

  const handleSelectChat = (chat) => {
    console.log("[ChatPage] Selected new chat:", chat.id);
    setSelectedChat(chat);
    toast.success(`Chat opened: ${chat.channel_name || 'New conversation'}`);
  };

  const handleBackToConversations = () => {
    console.log("[ChatPage] Returning to conversation list");
    setSelectedChat(null);
    setMessages([]);
  };

  const handleMessageDelete = (messageId) => {
    console.log("[ChatPage] Deleting message:", messageId);
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleConversationDeleted = (channelId: string) => {
    console.log("[ChatPage] Conversation deleted:", channelId);
    
    // Close the right sidebar
    setShowRightSidebar(false);
    
    // Navigate back to conversation list
    handleBackToConversations();
    
    // Show success message (but not duplicate since ActionsSection already shows one)
    // toast.success("Conversation deleted successfully");
  };

  const getPageTitle = () => {
    if (selectedChat) {
      const resolvedName = selectedChat.channel_name ||
        (!selectedChat.is_group
          ? selectedChat.participants
              .filter((p) => p.user_id !== currentUserId)
              .map((p) => p.display_name)
              .join(', ')
          : 'Unnamed Group');
      return resolvedName;
    }
    return 'Messages';
  };

  if (!selectedChat) {
    return (
      <>
        <Breadcrumb pageName="Messages" />
        <div className="chat-container">
          {!isMobile ? (
            <>
              <div className="chat-sidebar">
                <ChatSidebar 
                  selectedChat={null} 
                  onSelectChat={handleSelectChat}
                  onConversationDeleted={handleConversationDeleted}
                />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h2>Select a conversation</h2>
              </div>
            </>
          ) : (
            <div className="mobile-conversation-list">
              <ChatSidebar 
                selectedChat={null} 
                onSelectChat={handleSelectChat}
                onConversationDeleted={handleConversationDeleted}
              />
            </div>
          )}
        </div>
      </>
    );
  }

  const resolvedName =
    selectedChat.channel_name ||
    (!selectedChat.is_group
      ? selectedChat.participants
          .filter((p) => p.user_id !== currentUserId)
          .map((p) => p.display_name)
          .join(', ')
      : 'Unnamed Group');

  const sidebarParticipants = selectedChat.participants.map((p) => ({
    id:     p.user_id,
    name:   p.display_name,
    avatar: p.avatar_url,
    email:  p.email,
    online: p.online,
  }));

  return (
    <>
      <Breadcrumb pageName={getPageTitle()} />
      <div className="chat-container">
        {!isMobile ? (
          <>
            <div className="chat-sidebar">
              <ChatSidebar 
                selectedChat={selectedChat} 
                onSelectChat={handleSelectChat}
                onConversationDeleted={handleConversationDeleted}
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
                    onMessageDelete={handleMessageDelete}
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
                channelId={selectedChat.id}
                onClose={() => setShowRightSidebar(false)}
                onConversationDeleted={handleConversationDeleted}
              />
            </div>
          </>
        ) : (
          <div className="mobile-chat-view">
            <ChatHeader
              name={resolvedName}
              timestamp={selectedChat.last_message_at || ''}
              isGroup={selectedChat.is_group}
              currentUserId={currentUserId || ''}
              onInfoClick={() => setShowRightSidebar(!showRightSidebar)}
              onBackClick={handleBackToConversations}
              showBackButton={true}
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
                  onMessageDelete={handleMessageDelete}
                />
                <MessageInput
                  message={messageText}
                  onSetMessage={setMessageText}
                  handleSendMessage={handleSendMessage}
                />
                </>
            )}
            {showRightSidebar && (
              <div 
                className="mobile-right-sidebar-overlay"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowRightSidebar(false);
                  }
                }}
              >
                <div className="chat-right-sidebar-content">
                  <ChatRightSidebar
                    selectedChatName={resolvedName}
                    participants={sidebarParticipants}
                    avatarColors={avatarColors}
                    isGroup={selectedChat.is_group}
                    channelId={selectedChat.id}
                    onClose={() => setShowRightSidebar(false)}
                    onConversationDeleted={handleConversationDeleted}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}