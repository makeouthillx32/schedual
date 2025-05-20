'use client';

import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import './mobile.scss';

interface Message {
  id: string | number; // Updated to accept both string (UUID) and number
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
    
    // Use chart colors from design system for avatar backgrounds
    const chartColors = [
      'bg-[hsl(var(--chart-1))]',
      'bg-[hsl(var(--chart-2))]',
      'bg-[hsl(var(--chart-3))]',
      'bg-[hsl(var(--chart-4))]',
      'bg-[hsl(var(--chart-5))]'
    ];
    
    // Calculate a deterministic index based on avatar string
    const index = avatar.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % chartColors.length;
    
    return (
      <div className={`avatar-initials ${chartColors[index]}`}>
        <span className="text-xs font-semibold uppercase text-[hsl(var(--primary-foreground))]">{avatar}</span>
      </div>
    );
  };

  return (
    <div className="chat-messages">
      {messages.map((message) => {
        const isCurrentUser = message.sender.id === currentUserId;
        return (
          <div
            key={String(message.id)}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
          >
            {!isCurrentUser && (
              <div className="flex-shrink-0 mr-2">
                <div className="message-avatar rounded-full overflow-hidden shadow-[var(--shadow-xs)]">
                  {renderAvatar(message.sender.avatar, message.sender.name)}
                </div>
              </div>
            )}

            <div className={`message ${isCurrentUser ? 'order-1' : 'order-2'}`}>
              {!isCurrentUser && (
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1 ml-1 font-[var(--font-sans)]">
                  {message.sender.name}
                </div>
              )}

              <div className="flex flex-col">
                <div
                  className={`message-bubble shadow-[var(--shadow-xs)] ${
                    isCurrentUser
                      ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-tr-none'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-tl-none'
                  } rounded-[var(--radius)]`}
                >
                  <p className="text-sm break-words">{message.content}</p>

                  {message.image && (
                    <div className="mt-2 message-image">
                      <img
                        src={message.image}
                        alt="Shared"
                        className="max-w-full rounded-[calc(var(--radius)_-_2px)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns=%22http://www.w.org/2000/svg%22%20width=%22100%22%20height=%22100%22%20viewBox=%220%200%20100%20100%22%3E%3Cpath%20fill=%22%23CCC%22%20d=%22M0%200h100v100H0z%22/%3E%3Cpath%20fill=%22%23999%22%20d=%22M40%2040h20v20H40z%22/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-1 ml-1">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatMessageTime(message.timestamp)}
                  </span>

                  {message.likes > 0 && (
                    <div className="ml-2 flex items-center text-xs text-[hsl(var(--destructive))]">
                      <Heart size={12} fill="currentColor" className="mr-1" />
                      {message.likes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isCurrentUser && (
              <div className="flex-shrink-0 ml-2">
                <div className="message-avatar rounded-full overflow-hidden shadow-[var(--shadow-xs)]">
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