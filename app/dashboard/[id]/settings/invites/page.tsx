'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import './_components/invites.scss';

// Mock invites data
const MOCK_INVITES = [
  {
    inviter: {
      name: 'yoshi',
      avatar: 'https://via.placeholder.com/40',
      channel: '• General VC'
    },
    inviteCode: 'cZAajBFb',
    uses: 0,
    expires: '02:15:42:53'
  },
  {
    inviter: {
      name: 'imBlindFolded',
      avatar: 'https://via.placeholder.com/40',
      channel: '• General VC'
    },
    inviteCode: 'WTnaWvH',
    uses: 0,
    expires: '01:22:02:46'
  },
  {
    inviter: {
      name: 'unenter',
      avatar: 'https://via.placeholder.com/40',
      channel: '# r→general'
    },
    inviteCode: 'BXXmqKtz',
    uses: 0,
    expires: '04:09:42:16'
  },
  {
    inviter: {
      name: 'unenter',
      avatar: 'https://via.placeholder.com/40',
      channel: '# r→welcome'
    },
    inviteCode: 'yVZT2tGW96',
    uses: 19,
    expires: '∞'
  }
];

export default function InvitesPage() {
  const [invites, setInvites] = useState(MOCK_INVITES);

  const handleDeleteInvite = (inviteCode: string) => {
    setInvites(prev => prev.filter(invite => invite.inviteCode !== inviteCode));
  };

  return (
    <ShowcaseSection title="Invite Management">
      <div className="invites-page">
        {/* Header with Action Buttons */}
        <div className="invites-header">
          <h2 className="text-xl font-semibold text-dark dark:text-white">Active Invite Links</h2>
          <div className="action-buttons">
            <button className="pause-invites-btn px-4 py-2 rounded-lg border border-stroke dark:border-dark-3">
              Pause Invites
            </button>
            <button className="create-invite-btn px-4 py-2 rounded-lg">
              Create invite link
            </button>
          </div>
        </div>

        {/* Invites Table */}
        <div className="bg-white dark:bg-gray-dark border border-stroke dark:border-dark-3 rounded-lg overflow-hidden invites-table">
          {/* Table Header */}
          <div className="grid grid-cols-12 p-4 bg-gray-2 dark:bg-gray-800 text-dark-4 dark:text-dark-5 uppercase text-xs">
            <div className="col-span-4">Inviter</div>
            <div className="col-span-3">Invite Code</div>
            <div className="col-span-2">Uses</div>
            <div className="col-span-3">Expires</div>
          </div>

          {/* Invites List */}
          {invites.map((invite) => (
            <div 
              key={invite.inviteCode} 
              className="grid grid-cols-12 items-center p-4 border-b border-stroke dark:border-dark-3 last:border-b-0 invite-row relative"
            >
              {/* Inviter Column */}
              <div className="col-span-4 flex items-center space-x-3">
                <img 
                  src={invite.inviter.avatar} 
                  alt={invite.inviter.name} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-dark dark:text-white">{invite.inviter.name}</p>
                  <p className="text-sm text-dark-4 dark:text-dark-5">{invite.inviter.channel}</p>
                </div>
              </div>

              {/* Invite Code Column */}
              <div className="col-span-3 text-dark dark:text-white">
                {invite.inviteCode}
              </div>

              {/* Uses Column */}
              <div className="col-span-2 text-dark-4 dark:text-dark-5">
                {invite.uses}
              </div>

              {/* Expires Column */}
              <div className="col-span-3 text-dark-4 dark:text-dark-5">
                {invite.expires}
              </div>

              {/* Delete Invite Button */}
              <div className="delete-invite">
                <button 
                  onClick={() => handleDeleteInvite(invite.inviteCode)}
                  className="delete-invite-icon hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full"
                >
                  <X size={20} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ShowcaseSection>
  );
}