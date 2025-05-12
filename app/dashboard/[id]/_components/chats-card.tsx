// app/dashboard/[id]/messages/_components/chats-card.tsx
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/format-message-time";
import { DotIcon } from "@/assets/icons";
import { getChatsData, ConversationSummary } from "./fetch";

export async function ChatsCard() {
  const data: ConversationSummary[] = await getChatsData();

  return (
    <div className="col-span-12 rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-4">
      <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        Chats
      </h2>

      <ul>
        {data.map((chat) => (
          <li key={chat.channel_id}>
            <Link
              href={`/dashboard/${chat.channel_id}/messages`}
              className="flex items-center gap-4.5 px-7.5 py-3 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
            >
              <div className="relative shrink-0">
                <Image
                  src={chat.participants[0]?.avatar_url || "/default-avatar.png"}
                  width={56}
                  height={56}
                  className="size-14 rounded-full object-cover"
                  alt={chat.channel_name}
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-white dark:ring-dark-2",
                    chat.unread_count > 0 ? "bg-red-500" : "bg-gray-400"
                  )}
                />
              </div>

              <div className="relative flex-grow">
                <h3 className="font-medium text-dark dark:text-white">
                  {chat.channel_name}
                </h3>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium dark:text-dark-5 xl:max-w-[8rem]",
                      chat.unread_count > 0 && "text-dark-4 dark:text-dark-6"
                    )}
                  >
                    {chat.last_message_content}
                  </span>

                  <DotIcon />

                  <time
                    className="text-xs"
                    dateTime={chat.last_message_at}
                  >
                    {formatMessageTime(chat.last_message_at)}
                  </time>
                </div>

                {chat.unread_count > 0 && (
                  <div className="pointer-events-none absolute right-0 top-1/2 aspect-square max-w-fit -translate-y-1/2 select-none rounded-full bg-primary px-2 py-0.5 text-sm font-medium text-white">
                    {chat.unread_count}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
