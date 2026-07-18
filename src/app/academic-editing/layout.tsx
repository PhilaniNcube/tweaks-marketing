import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Editing Services",
  description: "Comprehensive academic editing for theses, dissertations, and research articles. We polish language, flow, and formatting.",
  keywords: ["academic editing", "thesis editing", "dissertation editing", "proofreading services", "academic proofreader", "South Africa"],
  openGraph: {
    title: "Academic Editing Services | Tweaks Academic",
    description: "Comprehensive academic editing for theses, dissertations, and research articles.",
    url: "/academic-editing",
  },
};

export default function AcademicEditingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
