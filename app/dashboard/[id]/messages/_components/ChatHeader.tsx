'use client';

import { Info, Phone, Video, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './mobile.scss';

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
  onBackClick?: () => void; // New prop for back navigation
  showBackButton?: boolean; // New prop to control back button visibility
}

export default function ChatHeader({
  name,
  timestamp,
  isGroup,
  participants,
  currentUserId,
  onInfoClick,
  onBackClick,
  showBackButton = false
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
      {/* Back button for mobile */}
      {showBackButton && onBackClick && (
        <button 
          onClick={onBackClick}
          className="chat-header-back-button mr-2 md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      
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