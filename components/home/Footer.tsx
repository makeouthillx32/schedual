"use client";

import useLoginSession from "@/lib/useLoginSession";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { tools } from "@/lib/toolsConfig";
import { useHallMonitor } from "@/hooks/useHallMonitor";

const socialLinks = [
  { icon: <FaInstagram className="size-5" />, href: 'https://instagram.com/YourPage', label: 'Instagram' },
  { icon: <FaTiktok className="size-5" />, href: 'https://tiktok.com/@YourPage', label: 'TikTok' },
  { icon: <FaYoutube className="size-5" />, href: 'https://youtube.com/YourPage', label: 'YouTube' },
  { icon: <FaLinkedinIn className="size-5" />, href: 'https://linkedin.com/company/YourPage', label: 'LinkedIn' },
];

// Smart Dashboard Link Component using Hall Monitor
const SmartDashboardLink: React.FC<{ userId: string }> = ({ userId }) => {
  const { user, isLoading, error } = useHallMonitor(userId);

  // Show loading state
  if (isLoading) {
    return <span className="text-muted-foreground">Loading Dashboard...</span>;
  }

  // Show error state or fallback
  if (error || !user) {
    return (
      <Link href="/dashboard/me" className="hover:underline">
        Dashboard
      </Link>
    );
  }

  // Return role-specific dashboard link
  const getDashboardInfo = () => {
    switch (user.role) {
      case 'admin':
        return {
          text: 'Admin Dashboard',
          href: '/dashboard/me',
        };
      case 'jobcoach':
        return {
          text: 'Job Coach Dashboard',
          href: '/dashboard/me',
        };
      case 'client':
        return {
          text: 'Client Dashboard',
          href: '/dashboard/me',
        };
      case 'user':
        return {
          text: 'My Dashboard',
          href: '/dashboard/me',
        };
      default:
        return {
          text: 'Dashboard',
          href: '/dashboard/me',
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

  return (
    <Link href={dashboardInfo.href} className="hover:underline">
      {dashboardInfo.text}
    </Link>
  );
};

const Footer: React.FC = () => {
  const session = useLoginSession();

  // Define sections based on user session
  const getSections = () => {
    const baseSections = [
      {
        title: "Resources",
        links: [
          { name: "Help Center", href: "/help" },
          { name: "Contact Us", href: "/contact" },
          { name: "About DART", href: "/about" },
          { name: "Career Services", href: "/services" },
        ],
      },
    ];

    if (session?.user?.id) {
      return [
        {
          title: "For Job Coaches",
          links: [
            { name: "CMS App", href: "/CMS" },
            // Replace the hardcoded Dashboard link with our smart component
            { 
              name: <SmartDashboardLink userId={session.user.id} />, 
              href: "#", // href will be handled by the SmartDashboardLink component
              isComponent: true // Flag to identify this as a component
            },
            { name: "Reports", href: "/reports" },
            { name: "Settings", href: "/settings" },
          ],
        },
        {
          title: "Tools",
          links: tools.map(({ name, path }) => ({ name, href: path })),
        },
        ...baseSections,
      ];
    }

    return baseSections;
  };

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <section className="py-16 bg-[var(--background)] text-[var(--foreground)] border-t border-gray-200">
      <div className="container max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          {/* Logo and Description Section */}
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-3 lg:justify-start">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">DART</h2>
              </div>
            </div>
            
            {/* Description */}
            <p className="max-w-[70%] text-sm text-muted-foreground">
              Desert Area Resources and Training - Empowering individuals through comprehensive career services and job training programs.
            </p>
            
            {/* Social Links */}
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-primary transition-colors">
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Sections */}
          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {getSections().map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-[var(--foreground)]">{section.title}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {/* Handle both component links and regular links */}
                      {link.isComponent ? (
                        link.name // This is already a component (SmartDashboardLink)
                      ) : (
                        <Link href={link.href} className="hover:underline">
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Copyright and Legal Links */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-gray-200 py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">
            © {new Date().getFullYear()} Desert Area Resources and Training (DART). All rights reserved.
          </p>
          <ul className="order-1 flex flex-col gap-4 md:order-2 md:flex-row md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary transition-colors">
                <Link href={link.href} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Footer;