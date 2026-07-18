import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transcription Services",
  description: "Accurate and confidential audio transcription services for qualitative research interviews, focus groups, and academic recordings.",
  keywords: ["transcription services", "audio transcription", "qualitative research transcription", "interview transcription", "academic transcription"],
  openGraph: {
    title: "Transcription Services | Tweaks Academic",
    description: "Accurate and confidential audio transcription services for qualitative research interviews and academic recordings.",
    url: "/transcription",
  },
};

export default function TranscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
