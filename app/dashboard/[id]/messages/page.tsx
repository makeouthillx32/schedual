// app/dashboard/[id]/messages/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import {
  sendMessage,
  createOptimisticMessage,
  getUserProfileFromParticipants,
  resolveChatDisplayName,
  initializeAuth,
  type UserProfile
} from '@/utils/chatPageUtils';
import './_components/mobile.scss';

export default function ChatPage() {
  // Core state - MINIMAL now
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // UI state
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const isMounted = useRef(true);
  const chatMessagesRef = useRef<any>(null);

  // Initialize user authentication
  useEffect(() => {
    initializeAuth().then(userId => {
      if (isMounted.current) {
        setCurrentUserId(userId);
      }
    });
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle responsive layout
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Get user profile helper
  const getUserProfile = (userId: string): UserProfile | null => {
    if (selectedChat?.participants) {
      return getUserProfileFromParticipants(userId, selectedChat.participants);
    }
    return null;
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent, attachments: any[] = []) => {
    e.preventDefault();
    
    if ((!messageText.trim() && !attachments.length) || !selectedChat || !currentUserId) {
      if (!messageText.trim() && !attachments.length) return;
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
    
    // Create optimistic message
    const optimisticMessage = createOptimisticMessage(currentUserId, messageContent, userProfile, attachments);
    
    // Add to ChatMessages component via ref
    if (chatMessagesRef.current?.addOptimisticMessage) {
      chatMessagesRef.current.addOptimisticMessage(optimisticMessage);
    }
    
    try {
      await sendMessage(selectedChat.id, currentUserId, messageContent, attachments);
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err);
      toast.error("Failed to send message");
      // Remove optimistic message on error
      if (chatMessagesRef.current?.removeOptimisticMessage) {
        chatMessagesRef.current.removeOptimisticMessage(optimisticMessage.id);
      }
    }
  };

  // Simple event handlers
  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    toast.success(`Chat opened: ${chat.channel_name || 'New conversation'}`);
  };

  const handleBackToConversations = () => {
    setSelectedChat(null);
  };

  const handleConversationDeleted = (channelId: string) => {
    setShowRightSidebar(false);
    handleBackToConversations();
  };

  // Computed values - ULTRA minimal now
  const pageTitle = selectedChat ? resolveChatDisplayName(selectedChat, currentUserId) : 'Messages';

  // Render conversation list view
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

  // Render chat view
  return (
    <>
      <Breadcrumb pageName={pageTitle} />
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
                selectedChat={selectedChat}
                currentUserId={currentUserId}
                onInfoClick={() => setShowRightSidebar(!showRightSidebar)}
              />
              <ChatMessages
                ref={chatMessagesRef}
                channelId={selectedChat.id}
                currentUserId={currentUserId}
                participants={selectedChat.participants}
                avatarColors={{}} // Not needed anymore
              />
              <MessageInput
                message={messageText}
                onSetMessage={setMessageText}
                handleSendMessage={handleSendMessage}
              />
            </div>
            <div className={`chat-right-sidebar ${showRightSidebar ? 'open' : ''}`}>
              <ChatRightSidebar
                selectedChat={selectedChat}
                currentUserId={currentUserId}
                onClose={() => setShowRightSidebar(false)}
                onConversationDeleted={handleConversationDeleted}
              />
            </div>
          </>
        ) : (
          <div className="mobile-chat-view">
            <ChatHeader
              selectedChat={selectedChat}
              currentUserId={currentUserId}
              onInfoClick={() => setShowRightSidebar(!showRightSidebar)}
              onBackClick={handleBackToConversations}
              showBackButton={true}
            />
            <ChatMessages
              ref={chatMessagesRef}
              channelId={selectedChat.id}
              currentUserId={currentUserId}
              participants={selectedChat.participants}
              avatarColors={{}}
            />
            <MessageInput
              message={messageText}
              onSetMessage={setMessageText}
              handleSendMessage={handleSendMessage}
            />
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
                    selectedChat={selectedChat}
                    currentUserId={currentUserId}
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