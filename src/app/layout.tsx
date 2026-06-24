import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import PWARegister from '@/components/pwa-register';
import type { Viewport } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#090A0F',
};

export const metadata = {
  title: 'DivyaDhan — Brilliant Personal Wealth Management',
  description: 'Your digital CFO, Wealth Manager, Financial Planner, and AI Advisor. Track income, expenses, investments, goals, and more.',
  keywords: ['finance', 'money management', 'investment tracker', 'expense tracker', 'wealth management', 'financial planning', 'divyadhan'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DivyaDhan',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster richColors position="top-right" closeButton />
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

