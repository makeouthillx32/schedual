
// components/home/Footer.tsx

"use client";

import React from "react";
import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from 'react-icons/fa';

const socialLinks = [
  { icon: <FaFacebookF />, href: 'https://facebook.com/YourPage' },
  { icon: <FaTwitter />, href: 'https://twitter.com/YourPage' },
  { icon: <FaInstagram />, href: 'https://instagram.com/YourPage' },
  { icon: <FaTiktok />, href: 'https://tiktok.com/@YourPage' },
  { icon: <FaThreads />, href: 'https://threads.net/@YourPage' },
  { icon: <FaYoutube />, href: 'https://youtube.com/YourPage' },
  { icon: <FaLinkedinIn />, href: 'https://linkedin.com/company/YourPage' },
];

const Footer: React.FC = () => {
  const session = useLoginSession();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--home-header)] text-[var(--home-header-text)] py-6 border-t border-gray-200 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      {/* Job Coaches & Tools - shown only when logged in */}
      {session?.user?.id && (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div className="space-y-1">
            <div className="font-semibold">For Job Coaches</div>
            <Link href="/cms" className="underline hover:text-blue-500 block">
              CMS App
            </Link>
          </div>
          <div className="space-y-1">
            <div className="font-semibold">Tools</div>
            <Link href="/Tools/timesheet-calculator" className="underline hover:text-blue-500 block">
              Timesheet Calculator
            </Link>
            <Link href="/Tools/punch-card-maker" className="underline hover:text-blue-500 block">
              Punch Card Maker
            </Link>
          </div>
        </div>
      )}

      {/* Social Media Icons */}
      <div className="max-w-7xl mx-auto flex justify-center gap-4 mb-4">
        {socialLinks.map((s, idx) => (
          <Link key={idx} href={s.href} target="_blank" rel="noopener noreferrer">
            <div className="rounded-full bg-[var(--home-nav-bg)] text-[var(--home-nav-text)] p-3 hover:opacity-80">
              {s.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm">
        <span>© {currentYear} Desert Area, Resource, and Training (DART) | All Rights Reserved</span>
        <span className="hidden sm:inline">|</span>
        <Link href="#terms" className="underline hover:text-blue-500">
          Terms of Service
        </Link>
        <span>|</span>
        <Link href="#privacy" className="underline hover:text-blue-500">
          Privacy Policy
        </Link>
        <span className="hidden sm:inline">|</span>
        <span>Website by unenter</span>
      </div>
    </footer>
);
};

export default Footer;

