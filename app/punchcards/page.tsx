// app/punchcards/page.tsx
import { Metadata } from 'next';
import PunchCardClient from './PunchCardClient';

// Metadata for OpenGraph and SEO
export const metadata: Metadata = {
  title: 'DARTS Punch Card Maker | Professional Card Generator',
  description: 'DARTS punchcard maker! Use one of our templates or upload your own! Create professional punch cards with A4-optimized layouts for easy printing.',
  keywords: ['punch cards', 'card maker', 'DARTS', 'templates', 'printing', 'A4', 'professional cards'],
  authors: [{ name: 'DARTS' }],
  openGraph: {
    title: 'DARTS Punch Card Maker',
    description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
    type: 'website',
    url: '/punchcards',
    images: [
      {
        url: '/punchcards/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'DARTS Punch Card Maker - Professional card templates',
      },
    ],
    siteName: 'DARTS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DARTS Punch Card Maker',
    description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
    images: ['/punchcards/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PunchCardsPage() {
  return <PunchCardClient />;
}