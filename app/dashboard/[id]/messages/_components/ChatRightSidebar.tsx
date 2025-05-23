'use client';

import { Image, X, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRealtime } from '@/hooks/useRealtimeInsert';
import './ChatRightSidebar.scss';

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

  // Chart colors from design system for avatar backgrounds
  const chartColors = [
    'bg-[hsl(var(--chart-1))]',
    'bg-[hsl(var(--chart-2))]',
    'bg-[hsl(var(--chart-3))]',
    'bg-[hsl(var(--chart-4))]',
    'bg-[hsl(var(--chart-5))]'
  ];

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
    
    // Calculate a deterministic index based on avatar string
    const index = avatar.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % chartColors.length;
    
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-[hsl(var(--primary-foreground))] ${
          chartColors[index]
        }`}
      >
        <span className="text-xs font-semibold uppercase">{avatar}</span>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <div className="w-12 hidden lg:flex flex-col border-l border-[hsl(var(--border))]">
        <button onClick={() => setIsOpen(true)} className="p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-[var(--radius)]">
          <Pencil size={16} />
        </button>
        <button onClick={() => setIsOpen(true)} className="p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-[var(--radius)]">
          <Image size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="chat-right-sidebar-content h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col shadow-[var(--shadow-md)]">
      <div className="p-4 flex justify-between items-center border-b border-[hsl(var(--border))]">
        <h3 className="font-semibold">{isGroup ? 'Group Info' : 'Chat Info'}</h3>
        <div className="flex space-x-2">
          <button onClick={() => setIsOpen(false)} className="hidden lg:block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X size={16} />
          </button>
          <button onClick={onClose} className="lg:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center border-b border-[hsl(var(--border))]">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[hsl(var(--sidebar-primary))] mb-2 flex items-center justify-center shadow-[var(--shadow-sm)]">
          {isGroup ? (
            <span className="text-2xl font-semibold text-[hsl(var(--sidebar-primary-foreground))]">G</span>
          ) : (
            <span className="text-2xl text-[hsl(var(--sidebar-primary-foreground))] font-semibold">
              {selectedChatName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg text-center">{selectedChatName}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">
          {participants.length}{' '}
          {participants.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      <div className="participants-list p-4 border-b border-[hsl(var(--border))] overflow-y-auto">
        <h4 className="mb-3 font-semibold text-sm text-[hsl(var(--foreground))]">
          {isGroup ? 'Participants' : 'About'}
        </h4>
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="participant flex items-center">
              <div className="participant-avatar w-8 h-8 rounded-full overflow-hidden relative mr-2 shadow-[var(--shadow-xs)]">
                {renderAvatar(p.avatar, p.name)}
                {p.online && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-[hsl(var(--chart-2))] rounded-full border border-[hsl(var(--background))]"></div>
                )}
              </div>
              <div className="participant-info flex-1 min-w-0">
                <p className="name font-medium">{p.name}</p>
                <p className="status text-xs text-[hsl(var(--muted-foreground))]">
                  {p.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h4 className="mb-3 font-semibold text-sm text-[hsl(var(--foreground))]">Actions</h4>
        <div className="space-y-2">
          <button className="w-full py-2 px-3 text-left rounded-[var(--radius)] hover:bg-[hsl(var(--accent))] transition-colors">
            Search in conversation
          </button>
          <button className="w-full py-2 px-3 text-left rounded-[var(--radius)] hover:bg-[hsl(var(--accent))] transition-colors">
            Notification settings
          </button>
          {isGroup && (
            <button className="w-full py-2 px-3 text-left rounded-[var(--radius)] hover:bg-[hsl(var(--accent))] transition-colors">
              Add participants
            </button>
          )}
          <button className="w-full py-2 px-3 text-left text-[hsl(var(--destructive))] rounded-[var(--radius)] hover:bg-[hsl(var(--destructive))/0.1] transition-colors">
            {isGroup ? 'Leave group' : 'Delete conversation'}
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h4 className="mb-3 font-semibold text-sm text-[hsl(var(--foreground))]">Shared Media</h4>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square bg-[hsl(var(--muted))] rounded-[var(--radius)] flex items-center justify-center shadow-[var(--shadow-xs)]"
            >
              <Image size={20} className="text-[hsl(var(--muted-foreground))]" />
            </div>
          ))}
          <button className="aspect-square rounded-[var(--radius)] border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--sidebar-primary))] transition-colors">
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}