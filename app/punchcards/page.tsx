// app/punchcards/page.tsx
// NO "use client" here!
import { Metadata } from 'next';
import PunchCardClient from './PunchCardClient';

export const metadata: Metadata = {
  title: 'DARTS Punch Card Maker | Professional Card Generator',
  description: 'DARTS punchcard maker! Use one of our templates or upload your own! Create professional punch cards with A4-optimized layouts for easy printing.',
  metadataBase: new URL('https://schedual-five.vercel.app'),
  openGraph: {
    title: 'DARTS Punch Card Maker',
    description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
    type: 'website',
    url: '/punchcards',
    images: ['/images/Punchcardmaker.png'],
    siteName: 'DARTS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DARTS Punch Card Maker',
    description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
    images: ['/images/Punchcardmaker.png'],
  },
};

export default function PunchCardsPage() {
  return <PunchCardClient />;
}