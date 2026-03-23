import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from '@next/third-parties/google';
import Analytics from '@/components/ui/Analytics';

export const metadata: Metadata = {
  title: {
    default: 'FinNexus Lab — Financial Intelligence Platform',
    template: '%s | FinNexus Lab'
  },
  description: 'Data-driven insights on markets, strategy and capital. Institutional-quality research.',
  keywords: ['financial analysis','market research','india quick commerce','fintech analysis','business analytics portfolio'],
  authors: [{ name: 'FinNexus Lab' }],
  creator: 'FinNexus Lab',
  metadataBase: new URL('https://finnexuslab.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'FinNexus Lab — Financial Intelligence Platform',
    description: 'Data-driven insights on markets, strategy and capital. Institutional-quality research.',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },

  // ✅ ADDED FOR GOOGLE SEARCH CONSOLE
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <Analytics />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>

      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}