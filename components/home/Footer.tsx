"use client";

import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { tools } from "@/lib/toolsConfig";

const Footer: React.FC = () => {
  const session = useLoginSession();

  return (
    <footer className="bg-[var(--home-background)] text-[var(--home-header-text)] py-6 text-xs border-t border-gray-200 relative px-4 min-h-[5rem] flex items-center justify-center">
      <div className="text-center">
        © {new Date().getFullYear()} Desert Area Resources and Training (DART)
      </div>

      {session?.user?.id && (
        <div className="absolute left-4 text-left space-y-1">
          <div className="font-semibold text-[var(--home-header-text)]">For Job Coaches</div>
          <Link href="/CMS" className="underline hover:text-blue-500 block">
            CMS App
          </Link>
        </div>
      )}

      <div className="absolute right-4 text-right space-y-1">
        <div className="font-semibold text-[var(--home-header-text)]">Tools</div>
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.path}
            className="underline hover:text-blue-500 block"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
