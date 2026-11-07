import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal Article & Proposal Editing",
  description: "Expert editing for journal articles and research proposals to meet high-impact publication standards and reviewer expectations.",
  keywords: ["journal article editing", "proposal editing", "research proposal editing", "academic publication", "peer review editing"],
  openGraph: {
    title: "Journal Article & Proposal Editing | Tweaks Academic",
    description: "Expert editing for journal articles and research proposals to meet high-impact publication standards.",
    url: "/journal-article-proposal-editing",
  },
};

export default function JournalArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
