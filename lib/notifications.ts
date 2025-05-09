// lib/notifications.ts
// -----------------------------------------------------------------------------
// A tiny helper for writing a notification row to the `notifications` table.
// -----------------------------------------------------------------------------
//  •  Title & subtitle are mandatory (they are what the UI displays)
//  •  You *must* set at least one role flag **or** a receiverId so that the
//     notice is visible to somebody.
//  •  All other fields are optional.
// -----------------------------------------------------------------------------
//  Example
//  -------
//  await sendNotification({
//    title: "Piter joined the team!",
//    subtitle: "Congratulate him",
//    imageUrl: "/images/user/user-15.png",
//    role_admin: true,
//    role_jobcoach: true,
//  });
// -----------------------------------------------------------------------------
import { createClient } from "@/utils/supabase/server";

/** Fields accepted when creating a notification */
export interface NotificationInput {
  /** Main text shown in bold */
  title: string;
  /** Secondary line shown under the title */
  subtitle: string;

  /** Optional avatar / icon to show (absolute or public path) */
  imageUrl?: string | null;
  /** Optional link the row should open */
  actionUrl?: string | null;

  /** Optional sender (profiles.id) */
  senderId?: string | null;
  /** Optional single recipient (profiles.id) – leave null for broadcast */
  receiverId?: string | null;

  // ---------------------------------------------------------------------------
  // Visibility flags – at least one **must** be true unless receiverId is used
  // ---------------------------------------------------------------------------
  role_admin?: boolean;
  role_jobcoach?: boolean;
  role_client?: boolean;
  role_anonymous?: boolean;
}

/** Insert one row into `notifications` table */
export async function sendNotification(input: NotificationInput): Promise<void> {
  // Basic validation ----------------------------------------------------------
  if (!input.title?.trim() || !input.subtitle?.trim()) {
    throw new Error("Notification needs both title and subtitle");
  }

  const visibleToRole =
    input.role_admin ||
    input.role_jobcoach ||
    input.role_client ||
    input.role_anonymous;

  if (!visibleToRole && !input.receiverId) {
    throw new Error(
      "Notification must target at least one role flag or specify receiverId"
    );
  }

  // Insert --------------------------------------------------------------------
  const supabase = await createClient("service");

  const { error } = await supabase.from("notifications").insert({
    sender_id: input.senderId ?? null,
    receiver_id: input.receiverId ?? null,
    title: input.title,
    subtitle: input.subtitle,
    image_url: input.imageUrl ?? null,
    action_url: input.actionUrl ?? null,
    role_admin: !!input.role_admin,
    role_jobcoach: !!input.role_jobcoach,
    role_client: !!input.role_client,
    role_anonymous: !!input.role_anonymous,
  });

  if (error) throw new Error(error.message);
}
