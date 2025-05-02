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
    <footer className="bg-[var(--home-header)] text-[var(--home-header-text)] py-6 text-sm border-t border-gray-200 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      {session?.user?.id ? (
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row justify-between w-full gap-6">
            <div className="text-left space-y-1">
              <div className="font-semibold">For Job Coaches</div>
              <Link href="/cms" className="underline hover:text-blue-500 block">
                CMS App
              </Link>
            </div>

            <div className="hidden md:flex items-center justify-center space-x-4">
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

            <div className="text-right space-y-1">
              <div className="font-semibold">Tools</div>
              {/* Example tool links */}
              <Link href="/cms" className="underline hover:text-blue-500 block">CMS</Link>
              <Link href="/pickup" className="underline hover:text-blue-500 block">Pick-Up</Link>
              <Link href="/give" className="underline hover:text-blue-500 block">Give</Link>
            </div>
          </div>

          {/* Social links on mobile */}
          <div className="md:hidden flex justify-center space-x-4">
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
          <div className="text-center text-sm font-medium w-full">
            © {new Date().getFullYear()} Desert Area Resources and Training (DART)
          </div>
        </div>
      ) : (
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
          <div className="text-center text-sm font-medium">
            © {new Date().getFullYear()} Desert Area Resources and Training (DART)
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
