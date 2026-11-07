import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Privacy Policy of Tweaks Academic to understand how we protect your data and confidentiality during the editing process.",
  keywords: ["privacy policy", "confidentiality", "data protection", "NDA editing"],
  openGraph: {
    title: "Privacy Policy | Tweaks Academic",
    description: "Read the Privacy Policy of Tweaks Academic to understand how we protect your data and confidentiality.",
    url: "/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
