'use client';

import { Image, X, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtime } from '@/hooks/useRealtimeInsert';
import './mobile.scss';

// Create Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Participant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  online: boolean;
}

interface Props {
  selectedChatName: string;
  participants: Participant[];
  avatarColors: Record<string, string>;
  isGroup?: boolean;
  channelId?: string;
  onClose: () => void;
}

export default function ChatRightSidebar({
  selectedChatName,
  participants: initialParticipants,
  avatarColors,
  isGroup = false,
  channelId,
  onClose
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [participants, setParticipants] = useState(initialParticipants);
  const isMounted = useRef(true);

  // Update participants when props change
  useEffect(() => {
    if (isMounted.current) {
      setParticipants(initialParticipants);
    }
  }, [initialParticipants]);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Monitor presence/online status changes
  useRealtime<any>({
    supabase,
    table: 'presence',
    filter: channelId ? `channel_id=eq.${channelId}` : undefined,
    event: '*',
    onEvent: ({ new: newState, old: oldState, eventType }) => {
      if (!isMounted.current || !channelId) return;
      
      console.log(`[RightSidebar] Presence event: ${eventType}`, newState);
      
      // Handle presence updates (if presence system exists)
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        setParticipants(prev => {
          return prev.map(p => {
            if (p.id === newState.user_id) {
              return {
                ...p,
                online: newState.status === 'online'
              };
            }
            return p;
          });
        });
      }
    }
  });

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={`${name}'s avatar`}
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
      <div className="w-12 hidden lg:flex flex-col border-l">
        <button onClick={() => setIsOpen(true)} className="p-2">
          <Pencil size={16} />
        </button>
        <button onClick={() => setIsOpen(true)} className="p-2">
          <Image size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="chat-right-sidebar-content h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="font-semibold">{isGroup ? 'Group Info' : 'Chat Info'}</h3>
        <div className="flex space-x-2">
          <button onClick={() => setIsOpen(false)} className="hidden lg:block">
            <X size={16} />
          </button>
          <button onClick={onClose} className="lg:hidden">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center border-b">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-500 mb-2 flex items-center justify-center">
          {isGroup ? (
            <span className="text-2xl font-semibold text-white">G</span>
          ) : (
            <span className="text-2xl text-white font-semibold">
              {selectedChatName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg text-center">{selectedChatName}</h3>
        <p className="text-sm text-gray-500 text-center">
          {participants.length}{' '}
          {participants.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      <div className="participants-list p-4 border-b overflow-y-auto">
        <h4 className="mb-3 font-semibold text-sm">
          {isGroup ? 'Participants' : 'About'}
        </h4>
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="participant flex items-center">
              <div className="participant-avatar w-8 h-8 rounded-full overflow-hidden relative mr-2">
                {renderAvatar(p.avatar, p.name)}
                {p.online && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                )}
              </div>
              <div className="participant-info flex-1 min-w-0">
                <p className="name font-medium">{p.name}</p>
                <p className="status text-xs text-gray-500">
                  {p.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b">
        <h4 className="mb-3 font-semibold text-sm">Actions</h4>
        <div className="space-y-2">
          <button className="w-full py-2 px-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Search in conversation
          </button>
          <button className="w-full py-2 px-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Notification settings
          </button>
          {isGroup && (
            <button className="w-full py-2 px-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Add participants
            </button>
          )}
          <button className="w-full py-2 px-3 text-left text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            {isGroup ? 'Leave group' : 'Delete conversation'}
          </button>
        </div>
      </div>

      <div className="p-4 border-b">
        <h4 className="mb-3 font-semibold text-sm">Shared Media</h4>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"
            >
              <Image size={20} className="text-gray-400" />
            </div>
          ))}
          <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}