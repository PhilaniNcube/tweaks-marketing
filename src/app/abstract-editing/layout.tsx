import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abstract Editing Services",
  description: "Specialized abstract editing to summarize your research concisely and compellingly, improving your paper's acceptance chances.",
  keywords: ["abstract editing", "research abstract", "thesis abstract", "academic editing", "scientific abstract"],
  openGraph: {
    title: "Abstract Editing Services | Tweaks Academic",
    description: "Specialized abstract editing to summarize your research concisely and compellingly.",
    url: "/abstract-editing",
  },
};

export default function AbstractEditingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
