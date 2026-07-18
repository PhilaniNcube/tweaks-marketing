import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reference List Editing",
  description: "Precise reference list formatting and editing according to your required academic style guide (APA, Harvard, Vancouver, Chicago, etc.).",
  keywords: ["reference list editing", "bibliography editing", "APA referencing", "Harvard referencing", "Vancouver style", "Chicago style referencing"],
  openGraph: {
    title: "Reference List Editing | Tweaks Academic",
    description: "Precise reference list formatting and editing according to your required academic style guide.",
    url: "/reference-list-editing",
  },
};

export default function ReferenceListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
