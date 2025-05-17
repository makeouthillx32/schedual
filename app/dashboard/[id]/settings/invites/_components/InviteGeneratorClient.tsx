// app/components/invite/InviteGeneratorClient.tsx
"use client";

import InviteGenerator from "../../app/dashboard/[id]/settings/invites/_components/InviteGenerator";

export default function InviteGeneratorClient({ defaultRole = "client" }: { defaultRole?: string }) {
  return (
    <div className="w-full mt-10">
      <InviteGenerator defaultRole={defaultRole} />
    </div>
  );
}
