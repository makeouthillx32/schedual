// app/dashboard/[id]/messages/_components/ChatSidebarHeader.tsx
'use client';

import React from 'react';
import { PlusCircle } from 'lucide-react';

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
}

export default function ChatSidebarHeader({ onNewChat }: ChatSidebarHeaderProps) {
  return (
    <div className="p-3 flex justify-between items-center border-b">
      <h1 className="font-semibold text-lg">My Chats</h1>
      <button
        onClick={onNewChat}
        className="p-1 bg-blue-500 rounded-full text-white flex items-center justify-center"
        title="New chat"
      >
        <PlusCircle size={20} />
      </button>
    </div>
  );
}
