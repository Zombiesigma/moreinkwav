import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { CustomCursor } from '@/components/CustomCursor';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.moreink.web.id'),
  title: {
    default: 'More Ink. | Indonesian Rock Band',
    template: '%s | More Ink.'
  },
  description: 'More Ink. adalah band rock Indonesia berbasis di Ciputat, Tangerang Selatan. Dibentuk tahun 2023, beranggotakan Bintang Bataras, Muring Lviro, Ilhan Barief, dan Don Zapata. Menghadirkan suara mentah, getaran tanpa filter, dan frekuensi dalam bertinta.',
  keywords: [
    'More Ink', 'More Ink Band', 'Rock Band Indonesia', 'More Ink Ciputat Band',
    'Band Ciputat', 'South Tangerang Music', 'Indonesian Rock', 'Alternative Rock Indonesia',
    'Bintang Bataras', 'Muring Lviro', 'Ilhan Barief', 'Don Zapata',
    'anggota More Ink', 'personel More Ink', 'musik rock Indonesia', 'album More Ink',
    'lagu More Ink', 'rock alternatif', 'Ciputat rock scene', 'band Tangerang Selatan',
    'More Ink songs', 'More Ink discography', 'Indonesian indie rock'
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
    type: 'music.group',
    locale: 'id_ID',
    url: 'https://www.moreink.web.id',
    siteName: 'More Ink. Official',
    title: 'More Ink. | Original Sound',
    description: 'Band rock Indonesia asal Ciputat, Tangerang Selatan. Personil: Bintang Bataras, Muring Lviro, Ilhan Barief, Don Zapata. Musik rock alternatif dengan nuansa mentah dan penuh karakter.',
    images: [
      {
        url: 'https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg',
        width: 1200,
        height: 630,
        alt: 'More Ink. Band Logo',
      },
    ],
    music: {
      // Informasi album bisa ditambahkan jika sudah tersedia
      // album: [
      //   {
      //     url: 'https://www.moreink.web.id/album/debut',
      //     name: 'Nama Album',
      //   }
      // ],
      musician: [
        'Bintang Bataras',
        'Muring Lviro',
        'Ilhan Barief',
        'Don Zapata'
      ]
    }
  },
  twitter: {
    card: 'summary_large_image',
    title: 'More Ink. | Indonesian Rock Band',
    description: 'Band rock dari Ciputat: Bintang, Muring, Ilhan, Don. Suara mentah, frekuensi dalam bertinta.',
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
  alternates: {
    canonical: 'https://www.moreink.web.id',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: 'More Ink.',
    url: 'https://www.moreink.web.id',
    foundingDate: '2023',
    foundingLocation: {
      '@type': 'Place',
      name: 'Ciputat, South Tangerang, Indonesia',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ciputat',
        addressRegion: 'South Tangerang',
        addressCountry: 'ID'
      }
    },
    genre: ['Rock', 'Alternative Rock', 'Indonesian Rock'],
    description: 'More Ink. adalah band rock Indonesia yang berbasis di Ciputat, Tangerang Selatan. Mengusung suara mentah, getaran tanpa filter, dan frekuensi dalam bertinta.',
    member: [
      {
        '@type': 'Person',
        name: 'Bintang Bataras',
        roleName: 'Band Member'
      },
      {
        '@type': 'Person',
        name: 'Muring Lviro',
        roleName: 'Band Member'
      },
      {
        '@type': 'Person',
        name: 'Ilhan Barief',
        roleName: 'Band Member'
      },
      {
        '@type': 'Person',
        name: 'Don Zapata',
        roleName: 'Band Member'
      }
    ],
    // Jika album sudah tersedia, tambahkan array album di sini
    // album: [
    //   {
    //     '@type': 'MusicAlbum',
    //     name: 'Nama Album',
    //     url: 'https://www.moreink.web.id/album/nama-album',
    //     datePublished: 'YYYY-MM-DD'
    //   }
    // ],
    image: 'https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg',
    sameAs: [
      // Tambahkan link sosial media jika ada
      // 'https://www.instagram.com/moreink',
      // 'https://twitter.com/moreink',
      // 'https://www.youtube.com/@moreink'
    ]
  };

  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <Script
          id="json-ld-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased bg-background text-white selection:bg-white selection:text-black">
        <FirebaseClientProvider>
          <CustomCursor />
          <div className="noise-overlay print:hidden" />
          <div className="relative z-10">{children}</div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
