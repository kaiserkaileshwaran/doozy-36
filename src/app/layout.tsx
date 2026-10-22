import type { Metadata } from 'next'

import './globals.css'
import { ClientShell } from '../components/common/ClientShell'
import Script from 'next/script';






import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#800020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Doozy | Luxury Ethnic Atelier',
    template: '%s | Doozy Luxury Fashion',
  },
  description: 'Discover the finest Indian ethnic luxury fashion at Doozy. Handcrafted kurtas, bespoke lehengas, and premium banarasi silks crafted by master artisans.',
  keywords: ['Luxury Fashion', 'Indian Ethnic Wear', 'Designer Kurtas', 'Banarasi Silk', 'Chikankari', 'Doozy'],
  authors: [{ name: 'Doozy Atelier' }],
  creator: 'Doozy',
  publisher: 'Doozy',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('https://doozy.fashion'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Doozy | Luxury Ethnic Atelier',
    description: 'Experience unparalleled Indian ethnic luxury. Browse our exclusive collection of handcrafted ethnic wear.',
    url: 'https://doozy.fashion',
    siteName: 'Doozy',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Doozy Luxury Fashion',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doozy | Luxury Ethnic Atelier',
    description: 'Experience unparalleled Indian ethnic luxury.',
    images: ['/logo.jpg'],
    creator: '@doozyfashion',
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        
        <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" strategy="lazyOnload" />
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  )
}
