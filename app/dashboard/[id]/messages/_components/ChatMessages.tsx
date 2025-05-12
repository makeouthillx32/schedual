'use client';

import { Heart } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: number;
  sender: {
    id: string;
    name: string;
    avatar: string;
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
    } catch (error) {
      return '';
    }
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
                <div 
                  className={`w-8 h-8 rounded-full ${avatarColors[message.sender.avatar] || 'bg-gray-500'} flex items-center justify-center text-white`}
                >
                  <span className="text-xs font-semibold">{message.sender.avatar}</span>
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
                          // If image fails to load
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cpath%20fill%3D%22%23CCC%22%20d%3D%22M0%200h100v100H0z%22%2F%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M40%2040h20v20H40z%22%2F%3E%3C%2Fsvg%3E';
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
                <div 
                  className={`w-8 h-8 rounded-full ${avatarColors[message.sender.avatar] || 'bg-gray-500'} flex items-center justify-center text-white`}
                >
                  <span className="text-xs font-semibold">{message.sender.avatar}</span>
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