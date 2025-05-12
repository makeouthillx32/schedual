'use client';

import { Image, X, Pencil } from 'lucide-react';
import { useState } from 'react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  online: boolean;
}

interface ChatRightSidebarProps {
  selectedChatName: string;
  participants: Participant[];
  avatarColors: Record<string, string>;
  isGroup?: boolean;
}

export default function ChatRightSidebar({ 
  selectedChatName, 
  participants, 
  avatarColors,
  isGroup = false 
}: ChatRightSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="w-12 bg-white dark:bg-gray-dark border-l border-gray-200 dark:border-gray-800 flex flex-col items-center py-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 mb-4"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <Image size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-dark border-l border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {isGroup ? 'Group Info' : 'Chat Info'}
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col items-center border-b border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl mb-2">
          {isGroup ? (
            <span className="font-semibold">G</span>
          ) : (
            <span className="font-semibold">{selectedChatName.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
          {selectedChatName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
          {isGroup ? 'Participants' : 'About'}
        </h4>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full ${avatarColors[participant.avatar] || 'bg-gray-500'} flex items-center justify-center text-white mr-3`}>
                <span className="text-xs font-semibold">{participant.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {participant.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {participant.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media section */}
      <div className="p-4 flex-1">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
          Shared Media
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
            <img 
              src="/mountains.jpg" 
              alt="Shared media" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, use a placeholder
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cpath%20fill%3D%22%23CCC%22%20d%3D%22M0%200h100v100H0z%22%2F%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M40%2040h20v20H40z%22%2F%3E%3C%2Fsvg%3E';
              }}
            />
          </div>
          {/* Additional media placeholders */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          ))}
        </div>
      </div>
    </div>
  );
}