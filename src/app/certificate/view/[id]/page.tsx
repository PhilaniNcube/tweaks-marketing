import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificateById } from "@/app/actions/certificate";
import { CertificateDocument } from "@/components/certificate/certificate-document";
import { Award, ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const cert = await getCertificateById(resolvedParams.id);
  if (!cert || cert.status !== "completed") {
    return { title: "Certificate Not Found - Tweaks Academic Editing" };
  }
  return {
    title: `Academic Editing Certificate - ${cert.researcherName} | Tweaks`,
    description: `Official Academic Editing Certificate issued for ${cert.researcherName} (${cert.university}).`,
  };
}

export default async function CertificateViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const cert = await getCertificateById(resolvedParams.id);

  if (!cert || cert.status !== "completed" || !cert.researchTitle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Nav header (hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
            <Award className="w-4 h-4" /> Verified Certificate #{cert.id}
          </div>
        </div>

        {/* Certificate Printable Area */}
        <CertificateDocument
          data={{
            id: cert.id,
            researchTitle: cert.researchTitle,
            researcherName: cert.researcherName || "Researcher",
            university: cert.university || "University",
            completionDate: cert.completionDate || "July 2026",
          }}
          showPrintButton={true}
        />
      </div>
    </div>
  );
}
