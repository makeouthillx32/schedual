// app/punchcards/page.tsx
import { Metadata } from 'next';
import PunchCardClient from './PunchCardClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DARTS Punch Card Maker',
    description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
    openGraph: {
      title: 'DARTS Punch Card Maker',
      description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
      images: [
        {
          url: 'https://schedual-five.vercel.app/images/Punchcardmaker.png',
          width: 1200,
          height: 630,
        }
      ],
      url: 'https://schedual-five.vercel.app/punchcards',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'DARTS Punch Card Maker',
      description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
      images: ['https://schedual-five.vercel.app/images/Punchcardmaker.png'],
    },
  };
}

export default function PunchCardsPage() {
  return <PunchCardClient />;
}