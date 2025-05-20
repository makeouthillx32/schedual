// app/dashboard/[id]/messages/_components/ConversationListItem.tsx
'use client';

import React from 'react';
import type { Conversation } from './ChatSidebar';

interface ConversationListItemProps {
  conv: Conversation;
  isSelected: boolean;
  formatTimestamp: (ts: string | null) => string;
  onSelect: (chat: Conversation) => void;
}

export default function ConversationListItem({ conv, isSelected, formatTimestamp, onSelect }: ConversationListItemProps) {
  return (
    <button
      onClick={() => onSelect(conv)}
      className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isSelected ? 'bg-gray-200 dark:bg-gray-600' : ''
      }`}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
          <span>{conv.channel_name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-medium truncate">{conv.channel_name}</span>
            {conv.last_message_at && (
              <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">
                {formatTimestamp(conv.last_message_at).replace(/about|less than/, '')}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <p className="text-xs text-gray-500 truncate">
              {conv.last_message ?? 'No messages yet'}
            </p>
            {conv.unread_count > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conv.unread_count > 9 ? '9+' : conv.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
