// components/AdminDashboard/messages.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import ChatSidebar, { Conversation } from "./_components/ChatSidebar";
import ChatHeader from "./_components/ChatHeader";
import ChatMessages, { Message } from "./_components/ChatMessages";
import MessageInput from "./_components/MessageInput";
import ChatRightSidebar from "./_components/ChatRightSidebar";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const avatarColors: Record<string, string> = {
  AL: "bg-blue-500",
  JA: "bg-orange-500",
  JE: "bg-green-500",
};

export default function MessagesModule() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    (async () => {
      const res = await fetch(`/api/messages/${selectedChat.id}`);
      if (!res.ok) return console.error("Failed to load messages");
      setMessages(await res.json());
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    })();
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !currentUserId) return;

    const { error } = await supabase.from("messages").insert({
      channel_id: selectedChat.id,
      sender_id: currentUserId,
      content: messageText.trim(),
    });

    if (error) console.error("Send error:", error.message);
    else setMessageText("");
  };

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

  const resolvedName =
    selectedChat.name ||
    (!selectedChat.is_group
      ? selectedChat.participants
          .filter((p) => p.user_id !== currentUserId)
          .map((p) => p.display_name)
          .join(", ")
      : "Unnamed Group");

  const sidebarParticipants = selectedChat.participants.map((p) => ({
    id: p.user_id,
    name: p.display_name,
    avatar: p.avatar_url,
    email: p.email,
    online: p.online,
  }));

  return (
    <div className="flex h-screen">
      <ChatSidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader
          name={resolvedName}
          timestamp={selectedChat.last_message_at || ''}
          isGroup={selectedChat.is_group}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
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
