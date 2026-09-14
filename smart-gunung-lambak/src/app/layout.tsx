import type { Metadata, Viewport } from 'next';
import { Fraunces, IBM_Plex_Mono, Outfit } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap'
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-plex-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Smart Gunung Lambak — A mountain, made an operating system',
  description: 'Visit the Smart Gunung Lambak pilot for MPK Kluang: live visitor app, ranger tablets, command-centre digital twin, SaaS admin, API console and SOS response — all on one mountain.',
  applicationName: 'Smart Gunung Lambak',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lambak'
  },
  formatDetection: {
    telephone: true
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#004AAD' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1D1A' }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} ${plexMono.variable}`}>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
