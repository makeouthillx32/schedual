// app/dashboard/[id]/messages/_components/NewChatModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Users, UserCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';
import { storage, CACHE_KEYS } from '@/lib/cookieUtils';
import { initializeAuth } from '@/utils/chatPageUtils';
import { Conversation } from './ChatSidebar';
import './NewChatModal.scss';

// Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// FIXED: Match your actual API response
interface User {
  id: string;
  display_name: string | null;
  avatar_url?: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export default function NewChatModal({ isOpen, onClose, onConversationCreated }: NewChatModalProps) {
  // Mode state
  const [mode, setMode] = useState<'dm' | 'group'>('dm');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  
  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Internal state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  // Initialize component when opened
  useEffect(() => {
    if (isOpen) {
      initializeModal();
    } else {
      resetModal();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [isOpen]);

  // Initialize modal data
  const initializeModal = async () => {
    try {
      console.log('[NewChatModal] Initializing modal...');
      
      // Get current user
      const userId = await getCurrentUser();
      if (!isMounted.current || !userId) {
        console.log('[NewChatModal] No user found');
        setError('Please sign in to start a chat');
        return;
      }

      console.log('[NewChatModal] Current user:', userId);
      setCurrentUserId(userId);
      
      // Load users for search
      await loadAllUsers(userId);
      
      // Focus search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
      
    } catch (err) {
      console.error('[NewChatModal] Error initializing:', err);
      setError('Failed to initialize chat creation');
    }
  };

  // Get current user ID
  const getCurrentUser = async (): Promise<string | null> => {
    try {
      // Check cache first
      const cachedUser = storage.get(CACHE_KEYS.CURRENT_USER) as { id?: string } | null;
      if (cachedUser?.id) {
        return cachedUser.id;
      }

      // Fallback to auth
      const userId = await initializeAuth();
      return userId;
    } catch (err) {
      console.error('[NewChatModal] Error getting current user:', err);
      return null;
    }
  };

  // FIXED: Load all users and filter out current user
  const loadAllUsers = async (currentUserId: string) => {
    if (hasLoadedUsers) return;
    
    try {
      console.log('[NewChatModal] Fetching users from API...');
      
      const response = await fetch('/api/get-all-users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const users: User[] = await response.json();
      console.log('[NewChatModal] Received users:', users);
      
      if (!isMounted.current) return;
      
      // Filter out current user
      const filteredUsers = users.filter(user => user.id !== currentUserId);
      console.log('[NewChatModal] Filtered users (excluding current):', filteredUsers);
      
      setAllUsers(filteredUsers);
      setHasLoadedUsers(true);
      
      if (filteredUsers.length === 0) {
        setError('No other users found. Users will appear here once they join.');
      } else {
        setError(null);
      }
      
    } catch (err) {
      console.error('[NewChatModal] Error loading users:', err);
      setError('Failed to load users');
    }
  };

  // Reset modal state
  const resetModal = () => {
    setMode('dm');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
    setError(null);
    setIsCreating(false);
    setIsSearching(false);
    setHasLoadedUsers(false); // Reset so it loads fresh next time
  };

  // FIXED: Handle search input - search by display_name only
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = () => {
      setIsSearching(true);
      
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(user => {
        // Don't show already selected users
        if (selectedUsers.some(selected => selected.id === user.id)) {
          return false;
        }
        
        // FIXED: Search only by display_name since that's what we have
        const name = (user.display_name || '').toLowerCase();
        return name.includes(query);
      });
      
      setSearchResults(filtered.slice(0, 10)); // Limit results
      setIsSearching(false);
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, allUsers, selectedUsers]);

  // Handle user selection
  const handleSelectUser = (user: User) => {
    if (mode === 'dm') {
      // For DM, replace selection
      setSelectedUsers([user]);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      // For group, add to selection
      if (!selectedUsers.some(selected => selected.id === user.id)) {
        setSelectedUsers(prev => [...prev, user]);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
  };

  // Remove selected user
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Create conversation
  const handleCreateConversation = async () => {
    if (mode === 'dm') {
      await createDirectMessage();
    } else {
      await createGroupChat();
    }
  };

  // Create DM
  const createDirectMessage = async () => {
    if (selectedUsers.length !== 1) {
      setError('Please select a user to start a DM');
      return;
    }

    if (!currentUserId) {
      setError('Authentication required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      console.log('[NewChatModal] Creating DM with user:', selectedUsers[0]);
      
      const response = await fetch('/api/messages/start-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: [selectedUsers[0].id],
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create DM: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const channelId = result.channelId || result;
      
      // Create conversation object
      const newConversation: Conversation = {
        id: channelId,
        channel_id: channelId,
        channel_name: selectedUsers[0].display_name || 'User',
        is_group: false,
        last_message: null,
        last_message_at: null,
        unread_count: 0,
        participants: [
          {
            user_id: currentUserId,
            display_name: 'You',
            avatar_url: '',
            email: '',
            online: true
          },
          {
            user_id: selectedUsers[0].id,
            display_name: selectedUsers[0].display_name || 'User',
            avatar_url: selectedUsers[0].avatar_url || '',
            email: '', // No email from API
            online: false
          }
        ]
      };
      
      onConversationCreated(newConversation);
      onClose();
      toast.success('Direct message created!');
      
    } catch (err) {
      console.error('[NewChatModal] Error creating DM:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  // Create group chat
  const createGroupChat = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user for the group');
      return;
    }

    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (!currentUserId) {
      setError('Authentication required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      console.log('[NewChatModal] Creating group with users:', selectedUsers);
      
      const response = await fetch('/api/messages/start-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName.trim(),
          participantIds: selectedUsers.map(user => user.id),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create group: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const channelId = result.channelId || result;
      
      // Create conversation object
      const newConversation: Conversation = {
        id: channelId,
        channel_id: channelId,
        channel_name: groupName.trim(),
        is_group: true,
        last_message: null,
        last_message_at: null,
        unread_count: 0,
        participants: [
          {
            user_id: currentUserId,
            display_name: 'You',
            avatar_url: '',
            email: '',
            online: true
          },
          ...selectedUsers.map(user => ({
            user_id: user.id,
            display_name: user.display_name || 'User',
            avatar_url: user.avatar_url || '',
            email: '', // No email from API
            online: false
          }))
        ]
      };
      
      onConversationCreated(newConversation);
      onClose();
      toast.success('Group chat created!');
      
    } catch (err) {
      console.error('[NewChatModal] Error creating group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group conversation');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Validation
  const isValid = mode === 'dm' 
    ? selectedUsers.length === 1
    : selectedUsers.length > 0 && groupName.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center" style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div 
        ref={modalRef}
        className="w-full max-w-md max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center" style={{
          borderBottom: '1px solid hsl(var(--border))'
        }}>
          <h2 className="text-lg font-semibold" style={{
            color: 'hsl(var(--card-foreground))'
          }}>New Conversation</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded"
            style={{
              color: 'hsl(var(--muted-foreground))',
              borderRadius: 'var(--radius)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--foreground))';
              e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mode Toggle */}
          <div className="flex mb-4 overflow-hidden" style={{
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 'var(--radius)'
          }}>
            <button
              className="flex-1 py-2 text-center transition-colors"
              style={{
                backgroundColor: mode === 'dm' ? 'hsl(var(--primary))' : 'transparent',
                color: mode === 'dm' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                borderRadius: 'calc(var(--radius) - 2px)'
              }}
              onClick={() => setMode('dm')}
            >
              <UserCircle size={16} className="inline mr-2" />
              Direct Message
            </button>
            <button
              className="flex-1 py-2 text-center transition-colors"
              style={{
                backgroundColor: mode === 'group' ? 'hsl(var(--primary))' : 'transparent',
                color: mode === 'group' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                borderRadius: 'calc(var(--radius) - 2px)'
              }}
              onClick={() => setMode('group')}
            >
              <Users size={16} className="inline mr-2" />
              Group Chat
            </button>
          </div>

          {/* Group Name Input */}
          {mode === 'group' && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-3"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="px-3 py-1 flex items-center text-sm"
                    style={{
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      borderRadius: '9999px',
                      border: '1px solid hsl(var(--primary) / 0.2)'
                    }}
                  >
                    <span>{user.display_name || 'User'}</span>
                    <button 
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-2 p-0.5"
                      style={{
                        color: 'hsl(var(--primary))',
                        borderRadius: '50%'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={mode === 'dm' ? "Search for a user..." : "Add people to group..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3"
              style={{
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                outline: 'none'
              }}
            />
          </div>

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto mb-4">
            {!hasLoadedUsers ? (
              <div className="text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <div className="animate-pulse">Loading users...</div>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No other users found yet.
              </div>
            ) : isSearching ? (
              <div className="text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <div className="animate-pulse">Searching...</div>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No users found for "{searchQuery}"
              </div>
            ) : searchQuery ? (
              // Show search results
              searchResults.map(user => (
                <div
                  key={user.id}
                  className="p-3 cursor-pointer flex items-center transition-colors"
                  style={{ borderRadius: 'var(--radius)' }}
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))'
                  }}>
                    {(user.display_name?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>
                      {user.display_name || 'User'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Show all users when no search
              allUsers.slice(0, 10).map(user => (
                <div
                  key={user.id}
                  className="p-3 cursor-pointer flex items-center transition-colors"
                  style={{ borderRadius: 'var(--radius)' }}
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))'
                  }}>
                    {(user.display_name?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>
                      {user.display_name || 'User'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm mb-4 p-3" style={{
              color: 'hsl(var(--destructive))',
              backgroundColor: 'hsl(var(--destructive) / 0.1)',
              border: '1px solid hsl(var(--destructive) / 0.2)',
              borderRadius: 'var(--radius)'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-3" style={{
          borderTop: '1px solid hsl(var(--border))'
        }}>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 transition-colors"
            style={{
              color: 'hsl(var(--muted-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              backgroundColor: 'transparent'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateConversation}
            disabled={!isValid || isCreating}
            className="px-6 py-2 transition-colors"
            style={{
              backgroundColor: (!isValid || isCreating) ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
              color: (!isValid || isCreating) ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))',
              borderRadius: 'var(--radius)',
              cursor: (!isValid || isCreating) ? 'not-allowed' : 'pointer',
              border: 'none'
            }}
          >
            {isCreating ? 'Creating...' : mode === 'dm' ? 'Start Chat' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}