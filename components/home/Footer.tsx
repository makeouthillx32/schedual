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
          {/* Job Coaches & Tools side-by-side */}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="font-semibold mb-1">For Job Coaches</div>
              <Link href="/CMS" className="underline hover:text-blue-500">
                CMS App
              </Link>
            </div>
            <div>
              <div className="font-semibold mb-1">Tools</div>
              <div className="space-y-1">
                <Link href="/CMS"     className="underline hover:text-blue-500 block">CMS</Link>
                <Link href="/pickup"  className="underline hover:text-blue-500 block">Pick‑Up</Link>
                <Link href="/donate"  className="underline hover:text-blue-500 block">Give</Link>
              </div>
            </div>
          </div>

          {/* Social icons */}
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

          {/* Copyright */}
          <div className="text-center text-sm font-medium">
            © {new Date().getFullYear()} Desert Area Resources and Training (DART)
          </div>

          {/* Privacy & Terms side-by-side with space-between */}
          <div className="flex justify-between w-full">
            <Link href="/privacy" className="underline hover:text-blue-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline hover:text-blue-500">
              Terms & Conditions
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
          {/* Social icons */}
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

          <div className="text-center text-sm font-medium">
            © {new Date().getFullYear()} Desert Area Resources and Training (DART)
          </div>

          {/* Privacy & Terms side-by-side */}
          <div className="flex justify-between w-full max-w-xs">
            <Link href="/privacy" className="underline hover:text-blue-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline hover:text-blue-500">
              Terms & Conditions
            </Link>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;