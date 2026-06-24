import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DivyaDhan — AI Financial OS',
    short_name: 'DivyaDhan',
    description: 'Your Sovereign Financial Operating System & AI-Powered Wealth Advisor',
    start_url: '/',
    display: 'standalone',
    background_color: '#090A0F',
    theme_color: '#1BD084',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
