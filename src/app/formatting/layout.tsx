import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Formatting Services",
  description: "Professional document formatting services to align your thesis or dissertation with university guidelines (APA, Harvard, etc.).",
  keywords: ["academic formatting", "thesis formatting", "dissertation layout", "university formatting guidelines", "APA formatting", "Harvard formatting"],
  openGraph: {
    title: "Academic Formatting Services | Tweaks Academic",
    description: "Professional document formatting services to align your thesis or dissertation with university guidelines.",
    url: "/formatting",
  },
};

export default function FormattingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
