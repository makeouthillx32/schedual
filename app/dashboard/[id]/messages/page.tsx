'use client';

import { useEffect, useRef, useState } from 'react';
import ChatSidebar, { Conversation } from './_components/ChatSidebar';
import ChatHeader from './_components/ChatHeader';
import ChatMessages, { Message } from './_components/ChatMessages';
import MessageInput from './_components/MessageInput';
import ChatRightSidebar from './_components/ChatRightSidebar';
import { createBrowserClient } from '@supabase/ssr';

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
    })();
  }, [selectedChat]);

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

  // 4️⃣ If no chat selected, show prompt
  if (!selectedChat) {
    return (
      <div className="flex h-screen">
        <ChatSidebar selectedChat={null} onSelectChat={setSelectedChat} />
        <div className="flex-1 flex items-center justify-center">
          <h2>Select a conversation</h2>
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

  // 6️⃣ Map participants into ChatRightSidebar’s shape
  const sidebarParticipants = selectedChat.participants.map((p) => ({
    id:     p.user_id,
    name:   p.display_name,
    avatar: p.avatar_url,
    email:  p.email,
    online: p.online,
  }));

  return (
    <div className="flex h-screen">
      <ChatSidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          name={resolvedName}
          timestamp={selectedChat.last_message_at || ''}
          isGroup={selectedChat.is_group}
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

      <ChatRightSidebar
        selectedChatName={resolvedName}
        participants={sidebarParticipants}
        avatarColors={avatarColors}
        isGroup={selectedChat.is_group}
      />
    </div>
  );
}
