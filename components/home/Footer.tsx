"use client";

import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa";

const socialLinks = [
  { icon: <FaInstagram size={20} />, href: 'https://instagram.com/YourPage' },
  { icon: <FaTiktok size={20} />, href: 'https://tiktok.com/@YourPage' },
  { icon: <FaYoutube size={20} />, href: 'https://youtube.com/YourPage' },
  { icon: <FaLinkedinIn size={20} />, href: 'https://linkedin.com/company/YourPage' },
];

const Footer: React.FC = () => {
  const session = useLoginSession();

  return (
    <footer className="bg-[var(--home-header)] text-[var(--home-header-text)] border-t border-gray-200 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 text-sm">
      {session?.user?.id ? (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Row 1: Job Coaches & Tools */}
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="font-semibold mb-1">For Job Coaches</div>
              <Link href="/cms" className="underline hover:text-blue-500">
                CMS App
              </Link>
            </div>
            <div className="text-center md:text-right">
              <div className="font-semibold mb-1">Tools</div>
              <div className="space-y-1">
                <Link href="/cms"     className="underline hover:text-blue-500 block">CMS</Link>
                <Link href="/pickup"  className="underline hover:text-blue-500 block">Pick‑Up</Link>
                <Link href="/donate"  className="underline hover:text-blue-500 block">Give</Link>
              </div>
            </div>
          </div>

          {/* Row 2: Social Icons */}
          <div className="flex justify-center space-x-4">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-[var(--home-nav-bg)] transition"
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Row 3: Copyright + Legal */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-center text-sm font-medium">
              © {new Date().getFullYear()} Desert Area Resources and Training (DART)
            </div>
            <div className="flex space-x-4">
              <Link href="/privacy" className="underline hover:text-blue-500">
                Privacy Policy
              </Link>
              <span>|</span>
              <Link href="/terms" className="underline hover:text-blue-500">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Unauthenticated footer */
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-4">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-[var(--home-nav-bg)] transition"
              >
                {link.icon}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="text-center text-sm font-medium">
              © {new Date().getFullYear()} Desert Area Resources and Training (DART)
            </div>
            <div className="flex space-x-4">
              <Link href="/privacy" className="underline hover:text-blue-500">
                Privacy Policy
              </Link>
              <span>|</span>
              <Link href="/terms" className="underline hover:text-blue-500">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;