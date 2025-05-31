// app/dashboard/[id]/messages/_components/ChatMessages.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtimeInsert } from '@/hooks/useRealtimeInsert';
import MessageItem from './MessageItem';
import MessageContextMenu from './MessageContextMenu';
import { type Message, type UserProfile } from '@/utils/chatPageUtils';
import {
  MessageManager,
  ClipboardService,
  ContextMenuManager,
  UserProfileManager
} from '@/services/messageServices';
import {
  ChatMessagesServiceFactory,
  ChatMessagesStateManager,
  EventHandlerCoordinator
} from '@/services/advancedMessageServices';
import './ChatMessages.scss';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Participant {
  user_id: string;
  display_name: string;
  avatar_url: string;
  email: string;
  online: boolean;
}

interface ChatMessagesProps {
  channelId: string | null;
  currentUserId: string | null;
  participants?: Participant[];
  avatarColors: Record<string, string>;
}

export default function ChatMessages({
  channelId,
  currentUserId,
  participants = [],
  avatarColors
}: ChatMessagesProps) {
  // Initialize state using state manager
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Core services
  const messageManager = useRef(new MessageManager(setMessages, messagesEndRef));
  const userProfileManager = useRef(new UserProfileManager(setUserProfiles, userProfiles));
  const contextMenuManager = useRef(new ContextMenuManager(setContextMenu, messages));

  // Advanced services
  const services = useRef(
    ChatMessagesServiceFactory.createServices(
      setMessages,
      setLoading,
      setUserProfiles,
      setContextMenu,
      userProfiles,
      messages,
      messagesEndRef,
      isMounted,
      (userId: string, participants: any[]) => userProfileManager.current.getUserProfile(userId, participants)
    )
  );

  // Event coordinator
  const eventCoordinator = useRef(new EventHandlerCoordinator(contextMenuManager, currentUserId));
  const eventHandlers = eventCoordinator.current.createHandlers();

  // Cleanup on unmount
  useEffect(() => {
    return services.current.stateManager.getCleanupFunction();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (channelId) {
      services.current.messageLoader.loadMessages(channelId);
    }
  }, [channelId]);

  // Build user profiles when participants change
  useEffect(() => {
    userProfileManager.current.buildProfilesFromParticipants(participants);
  }, [participants]);

  // Handle realtime message inserts
  useRealtimeInsert({
    supabase,
    table: 'messages',
    filter: channelId ? `channel_id=eq.${channelId}` : undefined,
    onInsert: (newMsg) => {
      services.current.realtimeHandler.handleNewMessage(newMsg, currentUserId, channelId, participants);
    },
  });

  // Simple event handlers
  const handleCopyMessage = (content: string) => {
    ClipboardService.copyMessage(content);
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    setIsDeleting(messageId);
    setContextMenu(null);
    
    const success = await messageManager.current.deleteMessage(messageId);
    setIsDeleting(success ? null : null); // Reset regardless of success
  };

  // Loading state
  if (loading) {
    return (
      <div className="chat-messages flex items-center justify-center">
        <div className="text-center text-[hsl(var(--muted-foreground))]">
          Loading messages...
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div 
      className="chat-messages"
      style={{
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))'
      }}
    >
      {messages.map((message) => (
        <MessageItem
          key={String(message.id)}
          message={message}
          currentUserId={currentUserId}
          isDeleting={isDeleting === message.id}
          onContextMenu={eventHandlers.handleContextMenu}
          onTouchStart={eventHandlers.handleTouchStart}
          onTouchEnd={eventHandlers.handleTouchEnd}
        />
      ))}
      
      {contextMenu && (
        <MessageContextMenu
          messageId={contextMenu.messageId}
          messageContent={contextMenu.messageContent}
          messageElement={contextMenu.messageElement}
          canDelete={contextMenu.canDelete}
          attachments={contextMenu.attachments}
          onDelete={() => handleDeleteMessage(contextMenu.messageId)}
          onCopy={handleCopyMessage}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}

// Export methods for parent to use
export type ChatMessagesRef = {
  addOptimisticMessage: (message: Message) => void;
  removeOptimisticMessage: (messageId: string | number) => void;
};