// app/dashboard/[id]/settings/invites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { X } from 'lucide-react';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import InviteGeneratorClient from './_components/InviteGeneratorClient';
import './_components/invites.scss';
// hmm

interface Invite {
  code: string;
  role: string;
  inviter: {
    name: string | null;
    avatar: string;
    channel?: string;
  };
  uses: number;
  max_uses: number;
  expires_at: string | null;
}

export default function InvitesPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);

  // Load roles lookup
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('id, role');
      if (!error && data) {
        const map = data.reduce((acc, r) => ({ ...acc, [r.id]: r.role }), {} as Record<string, string>);
        setRolesMap(map);
      }
    })();
  }, [supabase, user]);

  // Fetch invites
  const loadInvites = async () => {
    setLoading(true);
    const res = await fetch('/api/invite');
    if (!res.ok) {
      console.error('Failed to load invites:', await res.text());
      setInvites([]);
    } else {
      setInvites(await res.json());
    }
    setLoading(false);
  };
  useEffect(() => { loadInvites(); }, []);

  // Open create overlay
  const openGenerator = () => setShowGenerator(true);

  // Delete invite
  const handleDelete = async (code: string) => {
    if (!confirm('Revoke this invite?')) return;
    setDeletingCode(code);
    const res = await fetch(`/api/invite/${code}`, { method: 'DELETE' });
    if (!res.ok) {
      console.error('Failed to delete invite:', await res.text());
    } else {
      setInvites(prev => prev.filter(inv => inv.code !== code));
    }
    setDeletingCode(null);
  };

  // Handle new invite
  const handleCreate = (newInvite: Invite) => {
    setInvites(prev => [newInvite, ...prev]);
    setShowGenerator(false);
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
            <button onClick={openGenerator} className="create-invite-btn px-4 py-2 rounded-lg">
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
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading…</div>
          ) : invites.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No invites yet.</div>
          ) : (
            invites.map(inv => {
              const displayRole = rolesMap[inv.role] ?? inv.role;
              const displayName = inv.inviter.name ?? 'Unknown';
              const channel = inv.inviter.channel ?? '';
              const isDeleting = deletingCode === inv.code;
              const expiresText = inv.expires_at
                ? new Date(inv.expires_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : '∞';

              return (
                <div key={inv.code} className="grid grid-cols-12 items-center p-4 border-b border-stroke dark:border-dark-3 last:border-b-0 invite-row relative">
                  {/* Inviter Column */}
                  <div className="col-span-4 flex items-center space-x-3">
                    <img src={inv.inviter.avatar} alt={displayName} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-dark dark:text-white">{displayName}</p>
                      <p className="text-sm text-dark-4 dark:text-dark-5">{channel}</p>
                    </div>
                  </div>

                  {/* Invite Code Column */}
                  <div className="col-span-3 text-dark dark:text-white">{inv.code}</div>

                  {/* Uses Column */}
                  <div className="col-span-2 text-dark-4 dark:text-dark-5">{inv.uses} / {inv.max_uses}</div>

                  {/* Expires Column */}
                  <div className="col-span-3 text-dark-4 dark:text-dark-5">{expiresText}</div>

                  {/* Delete Invite Button */}
                  <div className="delete-invite">
                    <button onClick={() => handleDelete(inv.code)} disabled={isDeleting} className="delete-invite-icon hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full">
                      <X size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showGenerator && (
        <div className="generator-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="generator-modal relative bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-800" onClick={() => setShowGenerator(false)}>
              <X size={24} />
            </button>
            <InviteGeneratorClient defaultRole="client" onCreate={handleCreate} />
          </div>
        </div>
      )}
    </ShowcaseSection>
  );
}
