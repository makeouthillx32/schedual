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
}

export default function ChatHeader({
  name,
  timestamp,
  isGroup,
  participants,
  currentUserId
}: ChatHeaderProps) {
  let title = name ?? 'Unnamed Chat';

  if (!isGroup && participants && participants.length === 2) {
    const [userA, userB] = participants;
    const other = userA.user_id === currentUserId ? userB : userA;
    const self = userA.user_id === currentUserId ? userA : userB;
    title = `${self.display_name} ↔ ${other.display_name}`;
  }

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {timestamp && (
          <p className="text-sm text-gray-500">
            Last message {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        )}
      </div>
      <div className="flex space-x-4">
        <Video />
        <Phone />
        <Info />
      </div>
    </header>
  );
}
