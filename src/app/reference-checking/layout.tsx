import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reference Checking Services",
  description: "Thorough reference checking to ensure all your in-text citations match your bibliography accurately and consistently.",
  keywords: ["reference checking", "citation checking", "bibliography matching", "academic integrity check", "cross-referencing"],
  openGraph: {
    title: "Reference Checking Services | Tweaks Academic",
    description: "Thorough reference checking to ensure all your in-text citations match your bibliography accurately.",
    url: "/reference-checking",
  },
};

export default function ReferenceCheckingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
