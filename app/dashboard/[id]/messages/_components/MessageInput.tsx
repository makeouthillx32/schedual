'use client';

import { Smile, Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  message: string;
  onSetMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

export default function MessageInput({ message, onSetMessage, handleSendMessage }: MessageInputProps) {
  return (
    <div className="message-input">
      <form onSubmit={handleSendMessage} className="message-input-form">
        <button
          type="button"
          className="hidden sm:flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Smile size={20} />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onSetMessage(e.target.value)}
          className="flex-1 mx-2 py-2 px-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            message.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}