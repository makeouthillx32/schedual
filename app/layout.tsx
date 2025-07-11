import type { Metadata } from "next";
import { Providers } from "./provider";
import "./globals.css";

// Global metadata that will work with your existing opengraph-image.png files
export const metadata: Metadata = {
  title: {
    template: '%s | CMS Schedule App',
    default: 'CMS Schedule App',
  },
  description: 'Desert Area Resources and Training Schedule Management System',
  openGraph: {
    title: 'CMS Schedule App',
    description: 'Desert Area Resources and Training Schedule Management System',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://schedual-five.vercel.app',
    siteName: 'CMS Schedule App',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CMS Schedule App',
    description: 'Desert Area Resources and Training Schedule Management System',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://schedual-five.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}