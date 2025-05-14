'use client';

import { useState } from 'react';
import { Smile, Paperclip, Send } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { storage, CACHE_KEYS } from '@/lib/cookieUtils';
import './mobile.scss';

// Create Supabase client for DB operations
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MessageInputProps {
  channelId: string;
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onMessageSent?: (message: any) => void;
}

export default function MessageInput({
  channelId,
  currentUserId,
  messagesEndRef,
  onMessageSent
}: MessageInputProps) {
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Skip if no message, channel or user ID
    if (!messageText.trim() || !channelId || !currentUserId) {
      console.log("[MessageInput] Cannot send message - missing data");
      return;
    }

    const content = messageText.trim();
    console.log(`[MessageInput] Sending message to channel ${channelId}:`, content);
    
    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      image: null,
      sender: {
        id: currentUserId,
        name: 'You',
        avatar: '',
        email: '',
      }
    };
    
    // Update message cache
    const cacheKey = `${CACHE_KEYS.MESSAGES_PREFIX}${channelId}`;
    const cachedMessages = storage.get(cacheKey) || [];
    storage.set(cacheKey, [...cachedMessages, optimisticMessage], 300);
    
    // Clear input
    setMessageText('');
    
    // Call the callback if provided
    if (onMessageSent) {
      onMessageSent(optimisticMessage);
    }
    
    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    
    // Send to server
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          channel_id: channelId,
          sender_id: currentUserId,
          content
        }]);

      if (error) {
        console.error('[MessageInput] Send error:', error);
        
        // Remove optimistic message from cache on error
        const messages = storage.get(cacheKey) || [];
        const filtered = messages.filter(msg => msg.id !== optimisticMessage.id);
        storage.set(cacheKey, filtered, 300);
        
        // Let parent know message failed
        if (onMessageSent) {
          onMessageSent({ error, failedMessageId: optimisticMessage.id });
        }
      }
    } catch (err) {
      console.error('[MessageInput] Error sending message:', err);
      
      // Remove optimistic message from cache
      const messages = storage.get(cacheKey) || [];
      const filtered = messages.filter(msg => msg.id !== optimisticMessage.id);
      storage.set(cacheKey, filtered, 300);
      
      // Let parent know message failed
      if (onMessageSent) {
        onMessageSent({ error: err, failedMessageId: optimisticMessage.id });
      }
    }
  };

  return (
    <div className="message-input">
      <form onSubmit={handleSendMessage} className="message-input-form">
        <button type="button" className="message-input-icon emoji-button">
          <Smile size={20} />
        </button>

        <button type="button" className="message-input-icon attach-button">
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="message-input-field"
        />

        <button
          type="submit"
          disabled={!messageText.trim()}
          className={`send-button ${messageText.trim() ? 'active' : 'disabled'}`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}