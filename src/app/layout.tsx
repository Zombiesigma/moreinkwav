import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { CustomCursor } from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: {
    default: 'More Ink. | Original Sound from Ciputat',
    template: '%s | More Ink.'
  },
  description: 'More Ink. is an Indonesian rock band based in Ciputat, South Tangerang. Formed in 2023, crafting raw sounds, unfiltered vibrations, and deep ink-inspired frequencies.',
  keywords: [
    'More Ink', 
    'More Ink Band', 
    'Rock Band Indonesia', 
    'Band Ciputat', 
    'South Tangerang Music', 
    'Indonesian Rock', 
    'Alternative Rock Indonesia',
    'Bintang More Ink',
    'Muring Lviro',
    'Ilhan Barief',
    'Don Zapata'
  ],
  authors: [{ name: 'More Ink.' }],
  creator: 'More Ink.',
  publisher: 'More Ink.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://moreink.com',
    siteName: 'More Ink. Official',
    title: 'More Ink. | Original Sound',
    description: 'The official sound of More Ink. Indonesian rock band based in Ciputat, South Tangerang.',
    images: [
      {
        url: 'https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg',
        width: 1200,
        height: 630,
        alt: 'More Ink. Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'More Ink. | Original Sound',
    description: 'Indonesian rock band based in Ciputat, South Tangerang. Formed in 2023.',
    images: ['https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-white selection:bg-white selection:text-black">
        <FirebaseClientProvider>
          {/* Custom Mouse Interaction (Desktop Only) */}
          <CustomCursor />
          
          {/* Global Noise Overlay - Hidden on Print */}
          <div className="noise-overlay print:hidden" />
          
          <div className="relative z-10">
            {children}
          </div>
          
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
