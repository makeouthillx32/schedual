'use client';

import { Info, Phone, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Participant {
  user_id: string;
  display_name: string;
}

interface ChatHeaderProps {
  name?: string;
  timestamp?: string;
  isGroup?: boolean;
  participants?: Participant[];
  currentUserId: string;
  onInfoClick?: () => void;
}

export default function ChatHeader({
  name,
  timestamp,
  isGroup,
  participants,
  currentUserId,
  onInfoClick
}: ChatHeaderProps) {
  let title = name ?? 'Unnamed Chat';

  if (!isGroup && participants && participants.length === 2) {
    const [userA, userB] = participants;
    const other = userA.user_id === currentUserId ? userB : userA;
    const self = userA.user_id === currentUserId ? userA : userB;
    title = `${self.display_name} ↔ ${other.display_name}`;
  }

  return (
    <header className="chat-header">
      <div className="chat-header-title">
        <h2 className="text-xl font-semibold truncate">{title}</h2>
        {timestamp && (
          <p className="text-sm text-gray-500 truncate">
            Last message {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        )}
      </div>
      <div className="chat-header-actions">
        <button className="hidden md:flex">
          <Video size={20} />
        </button>
        <button className="hidden md:flex">
          <Phone size={20} />
        </button>
        <button onClick={onInfoClick}>
          <Info size={20} />
        </button>
      </div>
    </header>
  );
}