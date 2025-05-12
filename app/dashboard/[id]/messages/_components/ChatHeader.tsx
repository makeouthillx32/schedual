'use client';

import { Info, Phone, Video } from 'lucide-react';
import { format } from 'date-fns';

interface ChatHeaderProps {
  name: string;
  timestamp: string;
  isGroup?: boolean;
}

export default function ChatHeader({ name, timestamp, isGroup = false }: ChatHeaderProps) {
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch (err) {
      return '';
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {isGroup ? (
              <span className="font-semibold text-sm">G</span>
            ) : (
              <span className="font-semibold text-sm">{name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="font-semibold text-lg">{name}</h2>
          {timestamp && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last active {formatTimestamp(timestamp)}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
          <Phone size={18} />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
          <Video size={18} />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
          <Info size={18} />
        </button>
      </div>
    </div>
  );
}