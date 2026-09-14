import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Smart Gunung Lambak Pilot',
    short_name: 'Lambak',
    description: 'Visitor, ranger, command centre and IoT platform for Gunung Lambak.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#f4f7fb',
    theme_color: '#004AAD',
    orientation: 'portrait-primary',
    categories: ['travel', 'utilities', 'productivity'],
    shortcuts: [
      { name: 'Visitor passport', short_name: 'Passport', url: '/app?view=visitor' },
      { name: 'Ranger tasks', short_name: 'Ranger', url: '/app?view=ranger' },
      { name: 'Command centre', short_name: 'Command', url: '/app?view=command' },
      { name: 'API console', short_name: 'API', url: '/app?view=api' }
    ],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ]
  };
}
