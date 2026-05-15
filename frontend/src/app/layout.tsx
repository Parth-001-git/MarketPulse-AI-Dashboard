import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Market Intelligence Dashboard | Phase 6',
  description:
    'Real-time market data dashboard featuring Bitcoin and equity charts, price indicators, and technical analysis. Built with Next.js, FastAPI, and yfinance.',
  keywords: 'market dashboard, bitcoin, stocks, financial data, technical analysis',
  openGraph: {
    title: 'Market Intelligence Dashboard',
    description: 'Real-time market data — BTC, equities, indicators',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-surface-0 font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-surface-3 py-6 text-center text-xs text-text-muted">
          Market Intelligence Dashboard — Phase 6 &nbsp;·&nbsp; Powered by yfinance &amp; FastAPI
        </footer>
      </body>
    </html>
  );
}
