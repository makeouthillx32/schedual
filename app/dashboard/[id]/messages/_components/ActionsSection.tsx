// app/dashboard/[id]/messages/_components/ActionsSection.tsx
'use client';

import { ChevronDown, ChevronRight, Search, Bell, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDeleteConversation } from '@/hooks/useDeleteConversation';

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
  const { deleteConversation, isDeleting } = useDeleteConversation();
  
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

  // Use the hook to delete conversation
  const handleDeleteConversation = async () => {
    if (!channelId) {
      toast.error('Cannot delete conversation - missing channel ID');
      console.error('[ActionsSection] No channelId provided');
      return;
    }

    const action = isGroup ? 'leave this group' : 'delete this conversation';
    
    const confirmed = window.confirm(
      `Are you sure you want to ${action}? This action cannot be undone and will delete all messages, attachments, and reactions.`
    );
    
    if (!confirmed) return;

    console.log(`[ActionsSection] Using hook to delete conversation: ${channelId}`);
    
    const result = await deleteConversation(channelId);
    
    if (result.success) {
      console.log('[ActionsSection] Delete successful via hook, closing sidebar and notifying parent');
      
      // Close the sidebar first
      onClose();
      
      // Notify parent component about the deletion
      if (onConversationDeleted) {
        onConversationDeleted(channelId);
      }
    }
    // Hook already handles error toasts, so no need to handle errors here
  };

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
              disabled={isDeleting}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--destructive))',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isDeleting ? 0.6 : 1
              }}
              onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.1)')}
              onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={14} />
              {isDeleting ? 'Deleting...' : (isGroup ? 'Leave group' : 'Delete conversation')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}