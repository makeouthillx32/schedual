import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useSelectConversation() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Function to fetch a conversation by ID from the API
  const fetchConversationById = useCallback(async (conversationId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/messages/get-conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const allConversations = await response.json();
      const conversation = allConversations.find(
        conv => conv.id === conversationId || conv.channel_id === conversationId
      );
      
      if (conversation) {
        // Transform to match your component's expected format
        const transformedConversation = {
          id: conversation.id || conversation.channel_id,
          channel_id: conversation.channel_id,
          channel_name: conversation.channel_name,
          is_group: conversation.is_group,
          last_message: conversation.last_message_content || conversation.last_message,
          last_message_at: conversation.last_message_at,
          unread_count: conversation.unread_count || 0,
          participants: (conversation.participants || []).map((p) => ({
            user_id: p.user_id,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            email: p.email,
            online: p.online ?? false,
          })),
        };
        
        return transformedConversation;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to select a conversation (can be called programmatically)
  const selectConversation = useCallback((conversation) => {
    if (!conversation) return null;
    
    // Store in conversations cache
    setConversations(prev => {
      const exists = prev.find(c => c.id === conversation.id);
      if (!exists) {
        return [...prev, conversation];
      }
      return prev;
    });
    
    return conversation;
  }, []);

  // Function to select by ID (fetches if needed)
  const selectConversationById = useCallback(async (conversationId) => {
    // First check if we already have it cached
    const cachedConversation = conversations.find(
      conv => conv.id === conversationId || conv.channel_id === conversationId
    );
    
    if (cachedConversation) {
      return selectConversation(cachedConversation);
    }
    
    // If not cached, fetch it
    const conversation = await fetchConversationById(conversationId);
    if (conversation) {
      return selectConversation(conversation);
    }
    
    return null;
  }, [conversations, fetchConversationById, selectConversation]);

  // Function to navigate to messages page with a specific conversation
  const openConversation = useCallback((conversationId) => {
    router.push(`/dashboard/me/messages?chatId=${conversationId}`);
  }, [router]);

  // Function to get chatId from URL params
  const getChatIdFromUrl = useCallback(() => {
    return searchParams.get('chatId');
  }, [searchParams]);

  // Function to clear chatId from URL (useful after auto-selection)
  const clearChatIdFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('chatId');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  }, [searchParams, router]);

  return {
    // State
    conversations,
    isLoading,
    
    // Actions
    selectConversation,
    selectConversationById,
    openConversation,
    
    // URL helpers
    getChatIdFromUrl,
    clearChatIdFromUrl,
    
    // Cache management
    setConversations,
  };
}