import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://tweaks.co.za"
  ),
  title: {
    default: "Tweaks Academic Editing",
    template: "%s | Tweaks Academic Editing",
  },
  description:
    "Premium academic editing, journal article and proposal editing, formatting, reference checking, and reference list editing services for researchers, students, and academics.",
  keywords: [
    "academic editing",
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
      "Premium academic editing, journal article and proposal editing, formatting, and reference list editing services.",
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
      "Premium academic editing, journal article and proposal editing, formatting, and reference list editing services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
