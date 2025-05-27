export async function getOverviewData() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    views: {
      value: 3456,
      growthRate: 0.43,
    },
    profit: {
      value: 4220,
      growthRate: 4.35,
    },
    products: {
      value: 3456,
      growthRate: 2.59,
    },
    users: {
      value: 3456,
      growthRate: -0.95,
    },
  };
}

export async function getChatsData() {
  try {
    const response = await fetch('/api/messages/get-conversations', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch conversations:', response.status);
      return [];
    }

    const conversations = await response.json();
    
    return conversations.map((conv: any) => {
      const isGroup = conv.is_group;
      const displayName = conv.channel_name || 'Unnamed Chat';
      
      const getAvatarUrl = () => {
        if (isGroup) {
          return '/images/user/group-default.png';
        }
        
        const otherParticipant = conv.participants?.find((p: any) => p.user_id !== conv.current_user_id);
        return otherParticipant?.avatar_url || '/images/user/user-default.png';
      };
      
      const checkIfActive = () => {
        if (isGroup) {
          return conv.participants?.some((p: any) => p.online) || false;
        }
        
        const otherParticipant = conv.participants?.find((p: any) => p.user_id !== conv.current_user_id);
        return otherParticipant?.online || false;
      };

      return {
        id: conv.id || conv.channel_id,
        name: displayName,
        profile: getAvatarUrl(),
        isActive: checkIfActive(),
        lastMessage: {
          content: conv.last_message_content || conv.last_message || 'No messages yet',
          type: 'text',
          timestamp: conv.last_message_at || new Date().toISOString(),
          isRead: (conv.unread_count || 0) === 0,
        },
        unreadCount: conv.unread_count || 0,
        isGroup: isGroup,
        participants: conv.participants || [],
      };
    });
  } catch (error) {
    console.error('Error fetching chats data:', error);
    return [];
  }
}