import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { GoogleTagManager } from '@next/third-parties/google';
import PageViewTracker from '@/components/page-view-tracker';
import { Suspense } from 'react';

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://tweaks.co.za"),
  title: {
    default: "Tweaks Academic | Professional Academic Editing & Transcription",
    template: "%s | Tweaks Academic",
  },
  description: "Premium academic editing, journal article proposal editing, transcription, formatting, and reference list editing services for researchers, students, and academics.",
  keywords: [
    "academic editing",
    "transcription services",
    "journal article editing",
    "proposal editing",
    "reference list editing",
    "formatting",
    "abstract editing",
    "proofreading",
    "South Africa",
  ],
  authors: [{ name: "Tweaks Academic" }],
  creator: "Tweaks Academic",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    title: "Tweaks Academic | Professional Academic Editing & Transcription",
    description: "Premium academic editing, journal article proposal editing, transcription, formatting, and reference list editing services.",
    siteName: "Tweaks Academic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tweaks Academic | Professional Academic Editing & Transcription",
    description: "Premium academic editing, journal article proposal editing, transcription, formatting, and reference list editing services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <GoogleTagManager gtmId="GTM-TPP8GGMS" />
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
