// components/home/IntroBar.tsx
"use client";

import Link from "next/link";
import { navTree } from "@/lib/navTree";

interface IntroBarProps {
  /** active top‑level key ( “about”, “programs”, … ) */
  currentPage: string;
  /** click‑handler passed down from Home.tsx */
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function IntroBar({ currentPage, navigateTo }: IntroBarProps) {
  return (
    <nav className="sticky top-0 z-40 flex w-full overflow-x-auto bg-white/70 backdrop-blur dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-700">
      <ul className="mx-auto flex gap-6 px-4 py-3 text-sm font-medium">
        {navTree.map(({ key, label, href }) => (
          <li key={key}>
            <Link
              href={href}
              onClick={navigateTo(key)}
              className={
                key === currentPage
                  ? "text-primary underline underline-offset-4"
                  : "text-muted-foreground hover:text-primary"
              }
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}