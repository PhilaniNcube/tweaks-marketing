import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCertificateById } from "@/app/actions/certificate";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  FileText,
  ExternalLink,
  Award,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const cert = await getCertificateById(resolvedParams.id);
  if (!cert || cert.status !== "completed") {
    return { title: "Verification Failed - Tweaks Academic Editing" };
  }
  return {
    title: `Verify Certificate #${cert.id} - Tweaks Academic Editing`,
    description: `Official Certificate Verification for research work edited by Tweaks Academic Editing.`,
  };
}

export default async function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const cert = await getCertificateById(resolvedParams.id);

  const isValid = cert && cert.status === "completed";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-20 h-16 mx-auto">
            <Image
              src="/images/tweaks_logo.png"
              alt="Tweaks Academic Editing"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Certificate Verification Portal
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200 space-y-8 text-center">
          {isValid ? (
            <>
              {/* Success Badge */}
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Verified Certificate
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Certificate Authenticity Confirmed
                </h1>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  This research work has been professionally edited for academic clarity, coherence, and language accuracy by Tweaks Academic Editing.
                </p>
              </div>

              {/* Record Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Certificate ID
                  </span>
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    {cert.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" /> Research Title
                  </span>
                  <p className="text-sm font-bold text-slate-900 uppercase leading-snug">
                    {cert.researchTitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600" /> Researcher
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      {cert.researcherName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" /> Institution
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      {cert.university}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" /> Date of Completion:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {cert.completionDate}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Link
                  href={`/certificate/view/${cert.id}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm w-full"
                >
                  <Award className="w-4 h-4" /> View / Download Full Certificate <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Certificate Not Found</h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                The requested certificate ID could not be verified in our records. Please ensure the QR code or URL is correct.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors inline-block"
                >
                  Return to Tweaks Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center text-xs text-slate-500 py-6">
        <p>© {new Date().getFullYear()} Tweaks Academic Editing. All rights reserved.</p>
        <p className="mt-1">hello@tweaks.co.za | +27 79 788 30 64</p>
      </footer>
    </div>
  );
}
