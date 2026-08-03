"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  createCertificateToken,
  getAllCertificates,
  deleteCertificate,
} from "@/app/actions/certificate";
import { Certificate } from "@/db/schema";
import {
  Link as LinkIcon,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function CertificateGeneratePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  const [createdCert, setCreatedCert] = useState<Certificate | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      const data = await getAllCertificates();
      setCertificates(data);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setCreatedCert(null);

    const res = await createCertificateToken({ recipientEmail, note });
    if (res.success && res.certificate) {
      setCreatedCert(res.certificate);
      setRecipientEmail("");
      setNote("");
      fetchCertificates();
    } else {
      setErrorMsg(res.error || "Failed to generate link.");
    }
    setSubmitting(false);
  };

  const getClaimUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/certificate/claim/${token}`;
    }
    return `/certificate/claim/${token}`;
  };

  const handleCopy = (token: string) => {
    const url = getClaimUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate link?")) return;
    await deleteCertificate(id);
    fetchCertificates();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Award className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Academic Editing Certificate Generator
              </h1>
            </div>
            <p className="text-slate-600 text-sm">
              Generate secure client links for self-populated certificates.
            </p>
          </div>
        </div>

        {/* Generate Link Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Create New Client Secure Link
            </h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="client@university.ac.za"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reference Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master's Dissertation"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Generating Link..." : "Generate Secure Link"}
            </button>
          </form>

          {/* Newly Created Banner */}
          {createdCert && (
            <div className="p-4 md:p-5 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Link Created Successfully
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {createdCert.id}
                </span>
              </div>
              <p className="text-sm text-slate-700 font-medium">
                Send this secure link to your client:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getClaimUrl(createdCert.token)}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-purple-300 text-xs font-mono text-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(createdCert.token)}
                  className="px-4 py-2 bg-purple-700 text-white text-xs font-medium rounded-lg hover:bg-purple-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedToken === createdCert.token ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Certificates List */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Generated Certificate Links ({certificates.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading certificate links...
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No certificate links generated yet. Click above to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {cert.id}
                      </span>

                      {cert.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Pending Client Input
                        </span>
                      )}
                    </div>

                    {cert.status === "completed" && cert.researchTitle ? (
                      <div>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1 uppercase">
                          {cert.researchTitle}
                        </p>
                        <p className="text-xs text-slate-600">
                          Researcher: {cert.researcherName} ({cert.university})
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Awaiting client details submission
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {cert.recipientEmail && (
                        <span>Email: {cert.recipientEmail}</span>
                      )}
                      {cert.note && <span>Note: {cert.note}</span>}
                      <span>
                        Created: {new Date(cert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(cert.token)}
                      title="Copy Claim Link"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedToken === cert.token ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                        </>
                      )}
                    </button>

                    {cert.status === "completed" && (
                      <Link
                        href={`/certificate/view/${cert.id}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Certificate
                      </Link>
                    )}

                    <button
                      onClick={() => handleDelete(cert.id)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
