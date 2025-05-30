// app/dashboard/[id]/messages/_components/ActionsSection.tsx
'use client';

import { ChevronDown, ChevronRight, Search, Bell, UserPlus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

// Create Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ActionsSectionProps {
  isGroup: boolean;
  isCollapsed: boolean;
  channelId?: string;
  onToggle: () => void;
  onConversationDeleted?: (channelId: string) => void;
  onClose: () => void;
}

export default function ActionsSection({ 
  isGroup, 
  isCollapsed, 
  channelId,
  onToggle, 
  onConversationDeleted,
  onClose
}: ActionsSectionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Fetch user role when component mounts
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('[ActionsSection] Auth error:', authError);
          setLoadingRole(false);
          return;
        }

        // Fetch user profile with role information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            role,
            roles!role (
              name
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('[ActionsSection] Error fetching user role:', profileError);
        } else {
          const roleName = profile?.roles?.name || 'user';
          setUserRole(roleName);
          console.log('[ActionsSection] User role:', roleName);
        }
      } catch (error) {
        console.error('[ActionsSection] Error in fetchUserRole:', error);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, []);
  
  // Action handlers
  const handleSearchInConversation = () => {
    toast.success('Search functionality coming soon!');
  };

  const handleNotificationSettings = () => {
    toast.success('Notification settings coming soon!');
  };

  const handleAddParticipants = () => {
    toast.success('Add participants functionality coming soon!');
  };

  // Handle delete conversation with admin check
  const handleDeleteConversation = async () => {
    if (!channelId) {
      toast.error('Cannot delete conversation - missing channel ID');
      return;
    }

    // Check if user is admin
    if (loadingRole) {
      toast.error('Please wait while we verify your permissions...');
      return;
    }

    if (userRole !== 'admin') {
      // Show message with conversation ID for non-admins
      toast.error(`Only admins can delete conversations. Ask an admin to delete conversation ID: ${channelId}`, {
        duration: 6000, // Show for 6 seconds
      });
      
      // Also copy to clipboard for convenience
      try {
        await navigator.clipboard.writeText(channelId);
        toast.success('Conversation ID copied to clipboard', { duration: 3000 });
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      }
      
      return;
    }

    const action = isGroup ? 'leave this group' : 'delete this conversation';
    const actionPast = isGroup ? 'Left group' : 'Conversation deleted';
    
    const confirmed = window.confirm(
      `Are you sure you want to ${action}? This action cannot be undone and will delete all messages, attachments, and reactions.`
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      console.log(`[ActionsSection] Admin deleting conversation: ${channelId}`);
      
      const response = await fetch(`/api/messages/${channelId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ActionsSection] Delete API error: ${response.status} - ${errorText}`);
        
        let errorMessage = 'Failed to delete conversation';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[ActionsSection] Delete response:', data);

      if (data.success) {
        toast.success(`${actionPast} successfully`);
        
        // Close the sidebar first
        onClose();
        
        // Notify parent component about the deletion
        if (onConversationDeleted) {
          onConversationDeleted(channelId);
        }
      } else {
        throw new Error(data.error || 'Failed to delete conversation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete conversation';
      console.error('[ActionsSection] Delete conversation error:', error);
      toast.error(`Delete failed: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine button text and if it should be disabled
  const getDeleteButtonText = () => {
    if (isDeleting) return 'Deleting...';
    if (loadingRole) return 'Checking permissions...';
    if (userRole !== 'admin') return `Ask admin to delete`;
    return isGroup ? 'Leave group' : 'Delete conversation';
  };

  const isDeleteDisabled = isDeleting || loadingRole;

  return (
    <div style={{
      borderBottom: '1px solid hsl(var(--border))',
      backgroundColor: 'hsl(var(--card))',
      flexShrink: 0
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          color: 'hsl(var(--foreground))',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent) / 0.5)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span>Actions</span>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {!isCollapsed && (
        <div style={{ padding: '0 16px 12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              onClick={handleSearchInConversation}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--foreground))',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Search size={14} />
              Search in conversation
            </button>
            <button 
              onClick={handleNotificationSettings}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--foreground))',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell size={14} />
              Notification settings
            </button>
            {isGroup && (
              <button 
                onClick={handleAddParticipants}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--foreground))',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <UserPlus size={14} />
                Add participants
              </button>
            )}
            <button 
              onClick={handleDeleteConversation}
              disabled={isDeleteDisabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                border: 'none',
                color: userRole === 'admin' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                cursor: isDeleteDisabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isDeleteDisabled ? 0.6 : 1
              }}
              onMouseEnter={(e) => !isDeleteDisabled && userRole === 'admin' && (e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.1)')}
              onMouseLeave={(e) => !isDeleteDisabled && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={14} />
              {getDeleteButtonText()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}