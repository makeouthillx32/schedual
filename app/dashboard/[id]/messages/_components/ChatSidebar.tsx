'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import NewChatModal from './NewChatModal';
import { formatDistanceToNow } from 'date-fns';

export interface Participant {
  user_id:      string;
  display_name: string;
  avatar_url:   string;
  email:        string;
  online:       boolean;
}

export interface Conversation {
  id:              string;
  channel_id:      string;
  channel_name:    string;
  is_group:        boolean;
  last_message:    string | null;
  last_message_at: string | null;
  unread_count:    number;
  participants:    Participant[];
}

interface ChatSidebarProps {
  selectedChat: Conversation | null;
  onSelectChat: (chat: Conversation) => void;
}

export default function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/messages/get-conversations');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const raw = await res.json();

        const mapped: Conversation[] = raw.map((c: any) => ({
          id:              c.id ?? c.channel_id,
          channel_id:      c.channel_id,
          channel_name:    c.channel_name,
          is_group:        c.is_group,
          last_message:    c.last_message_content ?? null,
          last_message_at: c.last_message_at ?? null,
          unread_count:    c.unread_count ?? 0,
          participants:    (c.participants || []).map((p: any) => ({
            user_id:      p.user_id,
            display_name: p.display_name,
            avatar_url:   p.avatar_url,
            email:        p.email,
            online:       p.online ?? false,
          })),
        }));

        setConversations(mapped);
        // auto‑select first chat if none selected
        if (mapped.length > 0 && !selectedChat) {
          onSelectChat(mapped[0]);
        }
      } catch (err: any) {
        console.error(err);
        setError("You don't have any chats yet.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [selectedChat, onSelectChat]);

  const formatTimestamp = (ts: string | null) =>
    ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : '';

  return (
    <>
      <div className="w-64 bg-white dark:bg-gray-dark text-gray-900 dark:text-white flex flex-col border-r">
        <div className="p-4 flex justify-between border-b">
          <h1 className="font-semibold">My Chats</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 bg-blue-500 rounded-full text-white"
            title="New chat"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading…</div>
          ) : error ? (
            <div className="p-4 text-center text-gray-400">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No chats yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectChat(conv)}
                className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedChat?.id === conv.id
                    ? 'bg-gray-200 dark:bg-gray-600'
                    : ''
                }`}
              >
                <div className="font-medium">{conv.channel_name}</div>
                <div className="text-xs text-gray-500">
                  {conv.last_message ?? 'No messages yet'} •{' '}
                  {formatTimestamp(conv.last_message_at)}
                </div>
              </button>
            ))
          )}
        </div>

        <NewChatModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={onSelectChat}
        />
      </div>
    </>
  );
}
