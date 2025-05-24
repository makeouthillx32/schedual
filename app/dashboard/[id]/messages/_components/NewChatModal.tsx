'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Users, UserCircle } from 'lucide-react';
import { Conversation } from './ChatSidebar';
import './NewChatModal.scss';


interface User {
  id: string;
  display_name: string | null;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export default function NewChatModal({ isOpen, onClose, onConversationCreated }: NewChatModalProps) {
  const [mode, setMode] = useState<'dm' | 'group'>('dm');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  useEffect(() => {
    // Focus search input when modal opens
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    // Reset state when modal opens
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setGroupName('');
      setError(null);
    }
  }, [isOpen]);
  

  // Handle clicks outside the modal
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

  // Handle search query
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/get-all-users?search=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search users');
        }
        
        const users = await response.json();
        // Filter out already selected users and current user
        const filteredUsers = users.filter(
          (user: User) => 
            !selectedUsers.some(selected => selected.id === user.id) && 
            user.id !== currentUserId
        );
        setSearchResults(filteredUsers);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, selectedUsers, currentUserId]);

  const handleSelectUser = (user: User) => {
    if (mode === 'dm') {
      // For DM, just select one user
      setSelectedUsers([user]);
      // Clear search results
      setSearchQuery('');
      setSearchResults([]);
    } else {
      // For group, check if user is already selected
      if (selectedUsers.some(selected => selected.id === user.id)) {
        // User already selected, just return
        return;
      }
      
      // Add to selected users
      setSelectedUsers(prev => [...prev, user]);
      // Clear search input but keep search results
      setSearchQuery('');
      // Immediately update search results to remove the selected user
      setSearchResults(prev => prev.filter(result => result.id !== user.id));
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleCreateConversation = async () => {
    if (mode === 'dm') {
      if (selectedUsers.length !== 1) {
        setError('Please select a user to start a DM');
        return;
      }

      try {
        setIsLoading(true);
        
        // Make the request to your API endpoint
        const response = await fetch('/api/messages/start-dm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: [selectedUsers[0].id],
          }),
          // This makes sure cookies are sent with the request
          credentials: 'include',
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          throw new Error(`Failed to create DM: ${response.status} ${responseText}`);
        }

        let channelId;
        try {
          // Try to parse the response as JSON
          const data = JSON.parse(responseText);
          channelId = data;
        } catch (e) {
          // If parsing fails, use the raw text as the channel ID
          channelId = responseText;
        }
        
        // Create a conversation object to pass back
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
              user_id: currentUserId || '',
              display_name: 'You',
              avatar_url: '',
              email: '',
              online: true
            },
            {
              user_id: selectedUsers[0].id,
              display_name: selectedUsers[0].display_name || 'User',
              avatar_url: '',
              email: '',
              online: false
            }
          ]
        };
        
        onConversationCreated(newConversation);
        onClose();
      } catch (err) {
        console.error('Error creating DM:', err);
        setError('Failed to create conversation: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Group chat logic
      if (selectedUsers.length === 0) {
        setError('Please select at least one user for the group');
        return;
      }

      if (!groupName.trim()) {
        setError('Please enter a group name');
        return;
      }

      try {
        setIsLoading(true);
        
        // Make the request to your API endpoint
        const response = await fetch('/api/messages/start-group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // The backend will get the creator ID from the authenticated user
            name: groupName,
            participantIds: selectedUsers.map(user => user.id),
          }),
          // This makes sure cookies are sent with the request
          credentials: 'include',
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          throw new Error(`Failed to create group: ${response.status} ${responseText}`);
        }

        let channelId;
        try {
          // Try to parse the response as JSON
          const data = JSON.parse(responseText);
          channelId = data.channelId || data;
        } catch (e) {
          console.error("Error parsing response:", e);
          throw new Error("Invalid response format from server");
        }
        
        // Create a conversation object to pass back
        const newConversation: Conversation = {
          id: channelId,
          channel_id: channelId,
          channel_name: groupName,
          is_group: true,
          last_message: null,
          last_message_at: null,
          unread_count: 0,
          participants: [
            {
              user_id: currentUserId || '',
              display_name: 'You',
              avatar_url: '',
              email: '',
              online: true
            },
            ...selectedUsers.map(user => ({
              user_id: user.id,
              display_name: user.display_name || 'User',
              avatar_url: '',
              email: '',
              online: false
            }))
          ]
        };
        
        onConversationCreated(newConversation);
        onClose();
      } catch (err) {
        console.error('Error creating group chat:', err);
        setError('Failed to create group conversation: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Conversation</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Toggle between DM and Group Chat */}
          <div className="flex mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-2 text-center ${
                mode === 'dm' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setMode('dm')}
            >
              <UserCircle size={16} className="inline mr-2" />
              Direct Message
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                mode === 'group' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setMode('group')}
            >
              <Users size={16} className="inline mr-2" />
              Group Chat
            </button>
          </div>

          {/* Group name input (only for group mode) */}
          {mode === 'group' && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              />
            </div>
          )}

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{user.display_name || 'User'}</span>
                    <button 
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={mode === 'dm' ? "Search for a user..." : "Add more people..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* Search results */}
          <div className="max-h-60 overflow-y-auto mb-4">
            {isLoading ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                <div className="animate-pulse flex justify-center items-center">
                  <div className="h-2 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400">No users found</div>
            ) : (
              searchResults.map(user => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg flex items-center"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
                    {(user.display_name?.[0] || '?').toUpperCase()}
                  </div>
                  <span className="text-gray-900 dark:text-white">{user.display_name || 'User'}</span>
                </div>
              ))
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={isLoading || (mode === 'dm' ? selectedUsers.length !== 1 : selectedUsers.length === 0 || !groupName.trim())}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                isLoading || (mode === 'dm' ? selectedUsers.length !== 1 : selectedUsers.length === 0 || !groupName.trim())
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? 'Creating...' : mode === 'dm' ? 'Start Chat' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}