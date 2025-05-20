// app/dashboard/[id]/messages/_components/ConversationList.tsx
'use client';

import React from 'react';
import type { Conversation } from './ChatSidebar';
import ConversationListItem from './ConversationListItem';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  searchQuery: string;
  selectedChat: Conversation | null;
  onSelectChat: (conv: Conversation) => void;
  formatTimestamp: (ts: string | null) => string;
}

export default function ConversationList({
  conversations,
  isLoading,
  searchQuery,
  selectedChat,
  onSelectChat,
  formatTimestamp,
}: ConversationListProps) {
  const filtered = searchQuery
    ? conversations.filter(conv =>
        conv.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="overflow-y-auto flex-1">
      {isLoading ? (
        <div className="p-4 text-center text-gray-400">Loading chats...</div>
      ) : filtered.length === 0 ? (
        <div className="p-4 text-center text-gray-400">
          {searchQuery ? 'No matching chats' : 'No chats yet'}
        </div>
      ) : (
        filtered.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conv={conv}
            isSelected={selectedChat?.id === conv.id}
            formatTimestamp={formatTimestamp}
            onSelect={onSelectChat}
          />
        ))
      )}
    </div>
  );
}