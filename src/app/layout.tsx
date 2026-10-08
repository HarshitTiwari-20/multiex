import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MultiView – Live Multi‑Screen Dashboard',
  description: 'Monitor YouTube streams, news sites, dashboards … in one professional video‑wall.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}