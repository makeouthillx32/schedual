'use client';

import { Providers } from './provider';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setCookie } from '@/lib/cookieUtils';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Determine which layouts to exclude
  const isHome        = pathname === '/';
  const isToolsPage   = pathname.toLowerCase().startsWith('/tools');
  const isAuthPage    =
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/auth');
  const isDashboard   = pathname.startsWith('/dashboard');

  // If any of these are true, we skip Nav/Footer
  const excludeGlobalLayout = isHome || isToolsPage || isAuthPage || isDashboard;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Persist last non-auth path
    if (!isAuthPage) {
      setCookie('lastPage', pathname, { path: '/' });
    }

    // Initialize theme
    const theme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(theme === 'dark');

    // Update <meta name="theme-color">
    const computed = getComputedStyle(document.documentElement);
    const varName   = isHome
      ? theme === 'dark' ? '--home-nav-bg' : '--home-nav-bg'
      : theme === 'dark' ? '--hnf-background' : '--hnf-background';
    const color     = computed.getPropertyValue(varName)?.trim() || '#ffffff';
    let metaTag = document.querySelector("meta[name='theme-color']");
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', color);
  }, [pathname, isHome, isAuthPage]);

  return (
    <html lang="en" className={isDarkMode ? 'dark' : ''} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Providers>
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
