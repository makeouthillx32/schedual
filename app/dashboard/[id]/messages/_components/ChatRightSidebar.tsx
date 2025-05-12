'use client';

import { Image, X, Pencil } from 'lucide-react';
import { useState } from 'react';

interface Participant {
  id:          string;
  name:        string;
  avatar:      string;  // now holds a URL or initials
  email:       string;
  online:      boolean;
}
interface Props {
  selectedChatName: string;
  participants:     Participant[];
  avatarColors:     Record<string, string>;
  isGroup?:         boolean;
}

export default function ChatRightSidebar({
  selectedChatName,
  participants,
  avatarColors,
  isGroup = false
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={`${name}’s avatar`}
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

  if (!isOpen) {
    return (
      <div className="w-12 flex flex-col border-l">
        <button onClick={() => setIsOpen(true)}>
          <Pencil size={16} />
        </button>
        <button onClick={() => setIsOpen(true)}>
          <Image size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-l bg-white dark:bg-gray-dark text-gray-900 dark:text-white flex flex-col">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="font-semibold">{isGroup ? 'Group Info' : 'Chat Info'}</h3>
        <button onClick={() => setIsOpen(false)}>
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col items-center border-b">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-500 mb-2">
          {isGroup ? (
            <span className="text-2xl font-semibold">G</span>
          ) : (
            <span className="text-2xl font-semibold">
              {selectedChatName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg">{selectedChatName}</h3>
        <p className="text-sm text-gray-500">
          {participants.length}{' '}
          {participants.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      <div className="p-4 border-b">
        <h4 className="mb-3 font-semibold text-sm">
          {isGroup ? 'Participants' : 'About'}
        </h4>
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-500 mr-3">
                {renderAvatar(p.avatar, p.name)}
              </div>
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* …shared media, etc. */}
    </div>
  );
}
