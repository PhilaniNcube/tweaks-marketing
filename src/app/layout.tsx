import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageViewTracker from "@/components/page-view-tracker";
import WhatsappBubble from "@/components/whatsapp-bubble";
import { Suspense } from "react";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://tweaks.co.za",
  ),
  title: {
    default: "Tweaks Academic Editing",
    template: "%s | Tweaks Academic Editing",
  },
  description:
    "Premium academic editing, journal article proposal editing, transcription, formatting, and reference list editing services for researchers, students, and academics.",
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
    title: "Tweaks Academic Editing",
    description:
      "Premium academic editing, journal article proposal editing, transcription, formatting, and reference list editing services.",
    siteName: "Tweaks Academic Editing",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tweaks Academic Editing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-image.png"],
    title: "Tweaks Academic Editing",
    description:
      "Premium academic editing, journal article proposal editing, transcription, formatting, and reference list editing services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Script
          id="gtm-lazy"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TPP8GGMS');`,
          }}
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TPP8GGMS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <WhatsappBubble />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
