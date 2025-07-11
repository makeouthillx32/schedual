// app/punchcards/page.tsx
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import the client component
const PunchCardClient = dynamic(() => import('./PunchCardClient'), { ssr: false });

export const metadata: Metadata = {
  title: 'DARTS Punch Card Maker | Professional Card Generator',
  description: 'DARTS punchcard maker! Use one of our templates or upload your own! Create professional punch cards with A4-optimized layouts for easy printing.',
  openGraph: {
    title: 'DARTS Punch Card Maker',
    description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
    url: 'https://schedual-five.vercel.app/punchcards',
    type: 'website',
    images: [
      {
        url: 'https://schedual-five.vercel.app/images/Punchcardmaker.png',
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
    images: ['https://schedual-five.vercel.app/images/Punchcardmaker.png'],
  },
};

export default function PunchCardsPage() {
  return (
    <div>
      <PunchCardClient />
    </div>
  );
}