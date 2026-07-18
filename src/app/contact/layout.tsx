import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Tweaks Academic for a quote on our professional editing and transcription services.",
  keywords: ["contact tweaks academic", "editing quote", "transcription quote", "academic editing support"],
  openGraph: {
    title: "Contact Us | Tweaks Academic",
    description: "Get in touch with Tweaks Academic for a quote on our professional editing and transcription services.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
