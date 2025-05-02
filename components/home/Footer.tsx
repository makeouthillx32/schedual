"use client";

import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { tools } from "@/lib/toolsConfig";

const Footer: React.FC = () => {
  const session = useLoginSession();

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--home-header)] text-[var(--home-header-text)] py-6 text-sm border-t border-gray-200 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      {session?.user?.id ? (
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row justify-between w-full">
            <div className="text-left space-y-1">
              <div className="font-semibold">For Job Coaches</div>
              <Link href="/cms" className="underline hover:text-blue-500 block">
                CMS App
              </Link>
            </div>

            <div className="text-center text-sm font-medium hidden md:block self-end">
              © {year} Desert Area, Resource, and Training (DART)
            </div>

            <div className="text-right space-y-1">
              <div className="font-semibold">Tools</div>
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
          </div>

          {/* Centered copyright for mobile */}
          <div className="text-center text-sm font-medium md:hidden">
            © {year} Desert Area, Resource, and Training (DART)
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center text-sm font-medium">
            © {year} Desert Area, Resource, and Training (DART)
          </div>
        </div>
      )}

      {/* Bottom links */}
      <div className="mt-6 border-t pt-4 text-center space-x-4">
        <Link href="#terms" className="underline hover:text-blue-500">
          Terms of Service
        </Link>
        <Link href="#privacy" className="underline hover:text-blue-500">
          Privacy Policy
        </Link>
        <span className="mx-2">| Website by unenter</span>
      </div>
    </footer>
  );
};

export default Footer;
