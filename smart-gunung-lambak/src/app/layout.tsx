import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'Smart Gunung Lambak Pilot',
  description: 'Responsive full-stack visitor, ranger, command centre, admin, IoT and API platform for Gunung Lambak.',
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
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
