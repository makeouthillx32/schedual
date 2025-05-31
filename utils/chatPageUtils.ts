// utils/chatPageUtils.ts
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Message {
  id: string | number;
  sender: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  image: string | null;
  attachments?: any[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

// Fetch messages for a channel
export async function fetchChannelMessages(channelId: string): Promise<Message[]> {
  console.log(`[ChatUtils] Fetching messages for channel: ${channelId}`);
  
  const res = await fetch(`/api/messages/${channelId}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[ChatUtils] Failed to load messages: ${res.status}`, errorText);
    throw new Error("Failed to load messages");
  }
  
  const messageData = await res.json();
  console.log(`[ChatUtils] Received ${messageData.length} messages from API`);
  
  return messageData.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// Send a message with attachments
export async function sendMessage(
  channelId: string,
  currentUserId: string,
  messageContent: string,
  attachments: any[] = []
): Promise<string> {
  console.log(`[ChatUtils] Sending message to channel ${channelId}:`, messageContent);
  
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .insert({
      channel_id: channelId,
      sender_id: currentUserId,
      content: messageContent
    })
    .select('id')
    .single();
    
  if (messageError) {
    console.error('[ChatUtils] Message send error:', messageError);
    throw new Error("Failed to send message");
  }
  
  // Handle attachments if present
  if (attachments.length > 0) {
    const attachmentInserts = attachments.map(attachment => ({
      message_id: messageData.id,
      file_url: attachment.url,
      file_type: attachment.type,
      file_name: attachment.name,
      file_size: attachment.size
    }));
    
    const { error: attachmentError } = await supabase
      .from('message_attachments')
      .insert(attachmentInserts);
      
    if (attachmentError) {
      console.error('[ChatUtils] Attachment save error:', attachmentError);
      toast.error("Message sent but attachments failed to save");
    } else {
      toast.success(`Message sent with ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}!`);
    }
  }
  
  return messageData.id;
}

// Create optimistic message for UI
export function createOptimisticMessage(
  currentUserId: string,
  messageContent: string,
  userProfile: UserProfile,
  attachments: any[] = []
): Message {
  const optimisticId = `temp-${Date.now()}`;
  
  return {
    id: optimisticId,
    content: messageContent,
    timestamp: new Date().toISOString(),
    likes: 0,
    image: attachments?.find(a => a.type === 'image')?.url || null,
    attachments: attachments || [],
    sender: {
      id: currentUserId,
      name: userProfile.name,
      avatar: userProfile.avatar,
      email: userProfile.email
    }
  };
}

// Transform realtime message
export function transformRealtimeMessage(newMsg: any, senderProfile: UserProfile | null): Message {
  return {
    id: newMsg.id,
    content: newMsg.content,
    timestamp: newMsg.created_at || new Date().toISOString(),
    likes: 0,
    image: null,
    sender: {
      id: newMsg.sender_id,
      name: senderProfile?.name || newMsg.sender_name || 'Unknown User',
      avatar: senderProfile?.avatar || newMsg.sender_avatar || '', 
      email: senderProfile?.email || newMsg.sender_email || '',
    }
  };
}

// Get user profile from participants
export function getUserProfileFromParticipants(
  userId: string,
  participants: any[]
): UserProfile | null {
  const participant = participants.find(p => p.user_id === userId);
  if (participant) {
    return {
      id: participant.user_id,
      name: participant.display_name || 'User',
      avatar: participant.avatar_url || participant.display_name?.charAt(0)?.toUpperCase() || 'U',
      email: participant.email || ''
    };
  }
  return null;
}

// Build user profiles cache from participants
export function buildUserProfilesCache(participants: any[]): Record<string, UserProfile> {
  const cache: Record<string, UserProfile> = {};
  participants.forEach(participant => {
    cache[participant.user_id] = {
      id: participant.user_id,
      name: participant.display_name || 'User',
      avatar: participant.avatar_url || participant.display_name?.charAt(0)?.toUpperCase() || 'U',
      email: participant.email || ''
    };
  });
  return cache;
}

// Build user profiles cache from messages
export function buildUserProfilesCacheFromMessages(messages: Message[]): Record<string, UserProfile> {
  const cache: Record<string, UserProfile> = {};
  messages.forEach(message => {
    if (message.sender && message.sender.id) {
      cache[message.sender.id] = {
        id: message.sender.id,
        name: message.sender.name || 'User',
        avatar: message.sender.avatar || message.sender.name?.charAt(0)?.toUpperCase() || 'U',
        email: message.sender.email || ''
      };
    }
  });
  return cache;
}

// Resolve chat display name
export function resolveChatDisplayName(
  selectedChat: any,
  currentUserId: string | null
): string {
  return selectedChat.channel_name ||
    (!selectedChat.is_group
      ? selectedChat.participants
          .filter((p: any) => p.user_id !== currentUserId)
          .map((p: any) => p.display_name)
          .join(', ')
      : 'Unnamed Group');
}

// Initialize Supabase auth
export async function initializeAuth(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("[ChatUtils] Auth error:", error);
      return null;
    }
    if (data.user?.id) {
      console.log("[ChatUtils] User authenticated:", data.user.id);
      return data.user.id;
    }
    console.log("[ChatUtils] No authenticated user found");
    return null;
  } catch (err) {
    console.error("[ChatUtils] Auth initialization error:", err);
    return null;
  }
}