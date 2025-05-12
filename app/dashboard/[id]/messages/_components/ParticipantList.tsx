'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  online: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  avatarColors: Record<string, string>;
}

export default function ParticipantList({
  participants,
  avatarColors
}: ParticipantListProps) {
  const [showParticipants, setShowParticipants] = useState(true);

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div
        className="flex justify-between items-center mb-2 cursor-pointer"
        onClick={() => setShowParticipants(!showParticipants)}
      >
        <h3 className="font-medium">People</h3>
        <ChevronDown
          className={`transform ${showParticipants ? '' : '-rotate-90'} transition-transform`}
          size={18}
        />
      </div>

      {showParticipants && (
        <div>
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center mt-2">
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColors[participant.avatar]}`}
                >
                  {participant.avatar}
                </div>
                {participant.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {participant.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
