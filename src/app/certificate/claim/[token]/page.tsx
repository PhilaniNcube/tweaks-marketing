"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCertificateByToken, claimCertificate } from "@/app/actions/certificate";
import { Certificate } from "@/db/schema";
import { Award, CheckCircle2, ArrowRight, Building2, User, Calendar, FileText } from "lucide-react";

export default function ClaimCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [researchTitle, setResearchTitle] = useState("");
  const [researcherName, setResearcherName] = useState("");
  const [university, setUniversity] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  useEffect(() => {
    async function loadToken() {
      if (!token) return;
      const data = await getCertificateByToken(token);
      setCert(data);
      setLoading(false);

      if (data && data.status === "completed") {
        setResearchTitle(data.researchTitle || "");
        setResearcherName(data.researcherName || "");
        setUniversity(data.university || "");
        setCompletionDate(data.completionDate || "");
      } else {
        // Pre-fill completion date with current month and year e.g. "August 2026"
        const now = new Date();
        const monthYear = now.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });
        setCompletionDate(monthYear);
      }
    }
    loadToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setFormErrors({});

    const res = await claimCertificate({
      token,
      researchTitle,
      researcherName,
      university,
      completionDate,
    });

    if (res.success && res.certificateId) {
      router.push(`/certificate/view/${res.certificateId}`);
    } else {
      setErrorMsg(res.error || "Failed to generate certificate.");
      if (res.errors) {
        setFormErrors(res.errors as Record<string, string[]>);
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Validating link...</p>
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Invalid Link</h1>
          <p className="text-slate-600 text-sm">
            This certificate link is invalid or no longer exists. Please contact Tweaks Academic Editing for assistance.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (cert.status === "completed") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Certificate Generated</h1>
            <p className="text-slate-600 text-sm">
              Your Academic Editing Certificate has already been issued for:
            </p>
            <p className="text-base font-bold uppercase text-slate-900 pt-2">
              &quot;{cert.researchTitle}&quot;
            </p>
          </div>

          <Link
            href={`/certificate/view/${cert.id}`}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-700 text-white font-medium text-sm rounded-xl hover:bg-purple-800 transition-colors shadow-sm"
          >
            View / Print Certificate <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-16 mx-auto">
            <Image
              src="/images/tweaks_logo.png"
              alt="Tweaks Academic Editing"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Editing Certificate Form
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Please enter your research work details exactly as you would like them to appear on your official certificate.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-200 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Research Title */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="w-4 h-4 text-purple-600" />
                Research Title
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. EXPLORING THE ROLE OF STRATEGIC COMMUNICATION FOR REPUTATION MANAGEMENT IN THE PUBLIC SECTOR"
                value={researchTitle}
                onChange={(e) => setResearchTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm uppercase placeholder:normal-case leading-relaxed"
              />
              <p className="text-[12px] text-slate-500">
                Enter your complete dissertation or research paper title.
              </p>
              {formErrors.researchTitle && (
                <p className="text-xs text-red-600 font-medium">
                  {formErrors.researchTitle[0]}
                </p>
              )}
            </div>

            {/* Researcher Name */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <User className="w-4 h-4 text-purple-600" />
                Researcher Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Neil Shikwambana"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
              />
              {formErrors.researcherName && (
                <p className="text-xs text-red-600 font-medium">
                  {formErrors.researcherName[0]}
                </p>
              )}
            </div>

            {/* University */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Building2 className="w-4 h-4 text-purple-600" />
                University / Institution
              </label>
              <input
                type="text"
                required
                placeholder="e.g. University of South Africa"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
              />
              {formErrors.university && (
                <p className="text-xs text-red-600 font-medium">
                  {formErrors.university[0]}
                </p>
              )}
            </div>

            {/* Date of Completion */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Calendar className="w-4 h-4 text-purple-600" />
                Date of Completion
              </label>
              <input
                type="text"
                required
                placeholder="e.g. July 2026"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
              />
              <p className="text-[12px] text-slate-500">
                Month and year when editing was completed.
              </p>
              {formErrors.completionDate && (
                <p className="text-xs text-red-600 font-medium">
                  {formErrors.completionDate[0]}
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  Generate Official Certificate <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
