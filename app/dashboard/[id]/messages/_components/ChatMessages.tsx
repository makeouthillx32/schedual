'use client';

import { Heart } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: number;
  sender: {
    id: string;
    name: string;
    avatar: string;  // either initials or full URL
    email: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  image: string | null;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  avatarColors: Record<string, string>;
}

export default function ChatMessages({
  messages,
  currentUserId,
  messagesEndRef,
  avatarColors
}: ChatMessagesProps) {
  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  const renderAvatar = (avatar: string, name: string) => {
    // if it's a URL, render the image, otherwise initials
    if (avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-white ${
          avatarColors[avatar] || 'bg-gray-500'
        }`}
      >
        <span className="text-xs font-semibold uppercase">{avatar}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender.id === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isCurrentUser && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-500">
                  {renderAvatar(message.sender.avatar, message.sender.name)}
                </div>
              </div>
            )}

            <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
              {!isCurrentUser && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                  {message.sender.name}
                </div>
              )}

              <div className="flex flex-col">
                <div
                  className={`p-3 rounded-2xl ${
                    isCurrentUser
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {message.image && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img
                        src={message.image}
                        alt="Shared"
                        className="max-w-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22100%22%20height=%22100%22%20viewBox=%220%200%20100%20100%22%3E%3Cpath%20fill=%22%23CCC%22%20d=%22M0%200h100v100H0z%22/%3E%3Cpath%20fill=%22%23999%22%20d=%22M40%2040h20v20H40z%22/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-1 ml-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMessageTime(message.timestamp)}
                  </span>

                  {message.likes > 0 && (
                    <div className="ml-2 flex items-center text-xs text-red-500">
                      <Heart size={12} fill="currentColor" className="mr-1" />
                      {message.likes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isCurrentUser && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-500">
                  {renderAvatar(message.sender.avatar, message.sender.name)}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
