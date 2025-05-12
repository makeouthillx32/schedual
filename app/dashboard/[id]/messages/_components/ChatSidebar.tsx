'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import NewChatModal from './NewChatModal';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id?: string;
  channel_id: string;
  channel_name: string;
  is_group: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface ChatSidebarProps {
  selectedChat: Conversation | null;
  onSelectChat: (chat: Conversation) => void;
}

export default function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/messages/get-conversations');

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();

        const mapped = data.map((conv: any): Conversation => ({
          id: conv.id ?? conv.channel_id,
          channel_id: conv.channel_id,
          channel_name: conv.channel_name,
          is_group: conv.is_group,
          last_message: conv.last_message || null,
          last_message_at: conv.last_message_at || null,
          unread_count: conv.unread_count || 0,
        }));

        setConversations(mapped);

        if (mapped.length > 0 && !selectedChat) {
          onSelectChat(mapped[0]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('No chats yet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [selectedChat, onSelectChat]);

  const addNewConversation = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
    onSelectChat(conversation);
    setIsModalOpen(false);
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div className="w-64 bg-white dark:bg-gray-dark text-gray-900 dark:text-white flex flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-lg font-semibold">My Chats</h1>
          <button
            title="Start new chat"
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading chats...</div>
          ) : error ? (
            <div className="p-4 text-center text-gray-400">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No chats yet</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.channel_id}
                className={`p-4 cursor-pointer border-b border-gray-800 hover:bg-gray-800 ${
                  selectedChat?.channel_id === conversation.channel_id ? 'bg-gray-800' : ''
                }`}
                onClick={() => onSelectChat(conversation)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white">{conversation.channel_name}</h3>
                  {conversation.unread_count > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400 truncate">
                    {conversation.last_message || 'Say hello!'}
                  </p>
                  {conversation.last_message_at && (
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTimestamp(conversation.last_message_at)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationCreated={addNewConversation}
      />
    </>
  );
}
