"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileUp,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  LogOut,
  Lock,
  Unlock,
  Video,
  Award,
  Loader2,
  Calendar,
  CreditCard,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import {
  formatZarFromCents,
  PAYMENT_OPTION_LABELS,
  QUOTE_OUTCOME_LABELS,
  STAGE_LABELS,
} from "@/components/crm/crm-helpers";
import { formatDegreeSummary } from "@/lib/utils";
import { recordClientOpenedPackage } from "@/app/actions/crm";
import type { ClientPortalDashboardData } from "@/app/actions/portal";
import { parseClientSourceDocuments } from "@/lib/crm/client-documents";
import { toast } from "sonner";

interface PortalDashboardClientProps {
  data: ClientPortalDashboardData;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ".docx,.doc,.pdf,.txt,.rtf,.odt";

const PORTAL_STAGE_STEPS = [
  { key: "enquiry", label: "1. Quote Issued" },
  { key: "accepted", label: "2. Accepted & Booked" },
  { key: "in_progress", label: "3. Editing in Progress" },
  { key: "work_ready", label: "4. Work Ready" },
  { key: "complete", label: "5. Complete & Certified" },
] as const;

const STAGE_ORDER = [
  "enquiry",
  "quote_sent",
  "accepted",
  "in_progress",
  "work_ready",
  "review",
  "complete",
  "closed",
];

function appendTokenIfNeeded(
  url: string,
  token: string | null | undefined
): string {
  if (!url.startsWith("/api/r2/download") || !token) return url;
  if (url.includes("token=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

export function PortalDashboardClient({ data }: PortalDashboardClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    data.projects[0]?.project.id || ""
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openedProjectIds, setOpenedProjectIds] = useState<
    Record<string, boolean>
  >({});

  const activeItem =
    data.projects.find((item) => item.project.id === selectedProjectId) ||
    data.projects[0] ||
    null;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out of Client Portal");
    router.push("/portal/login");
    router.refresh();
  };

  const handleUploadFiles = async (
    filesInput: FileList | File[] | undefined | null
  ) => {
    const files = filesInput ? Array.from(filesInput) : [];
    if (files.length === 0 || !activeItem) return;
    setUploadError(null);

    for (const file of files) {
      if (file.size === 0) {
        setUploadError(`"${file.name}" is empty.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(
          `"${file.name}" exceeds the 50MB maximum upload limit.`
        );
        toast.error("File is too large (max 50MB).");
        return;
      }
    }

    setIsUploading(true);
    let uploadedCount = 0;

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", activeItem.project.id);
        formData.append("slot", "clientBrief");

        const res = await fetch("/api/r2/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          const message = json.error || `Failed to upload ${file.name}.`;
          setUploadError(message);
          toast.error("Upload failed", { description: message });
          break;
        }
        uploadedCount += 1;
      }

      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? "Document uploaded!"
            : `${uploadedCount} documents uploaded!`,
          {
            description:
              uploadedCount === 1
                ? `${files[0].name} has been added to your project.`
                : "All selected documents have been added to your project.",
          }
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.refresh();
      }
    } catch {
      const message = "Network error while uploading your document.";
      setUploadError(message);
      toast.error(message);
      if (uploadedCount > 0) {
        router.refresh();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleOpenPackage = async (
    projectId: string,
    quoteToken: string | undefined,
    alreadyOpened: boolean
  ) => {
    if (!quoteToken || alreadyOpened || openedProjectIds[projectId]) return;
    setOpenedProjectIds((prev) => ({ ...prev, [projectId]: true }));
    await recordClientOpenedPackage(quoteToken);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Portal Navigation Bar */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/portal" className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 bg-tweaks-blue text-white flex items-center justify-center font-black text-sm tracking-tighter">
                TW
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Tweaks Client Portal
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-tweaks-blue mt-0.5">
                  Academic Editing
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col items-end pr-2 border-r border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {data.client
                  ? `${data.client.firstName} ${data.client.surname}`.trim()
                  : data.sessionUser.name}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {data.sessionUser.email}
              </span>
            </div>

            <Link
              href="/contact"
              className="px-3 py-1.5 text-xs font-bold bg-tweaks-blue hover:bg-tweaks-red text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Request New Quote</span>
              <span className="sm:hidden">New Quote</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {!data.client || data.projects.length === 0 || !activeItem ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto mt-8">
            <div className="mx-auto h-12 w-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                No Projects Found for This Email
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                We could not find any editing projects linked to{" "}
                <strong className="font-mono text-slate-900 dark:text-white">
                  {data.sessionUser.email}
                </strong>
                . Make sure you are signed in with the exact email address used
                on your quote request.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold transition-colors"
              >
                Request a Quote
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-5 py-2.5 border border-red-200 dark:border-red-900/50 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
              >
                Sign Out &amp; Try Another Email
              </button>
            </div>
          </div>
        ) : (
          (() => {
            const {
              project,
              quote,
              items,
              payments,
              certificate,
              institutionName,
              includesReferencingReport,
            } = activeItem;

            const canUpload =
              !project.workReady &&
              project.stage !== "complete" &&
              project.stage !== "closed" &&
              project.stage !== "lost";

            const accessToken = quote?.token || project.accessToken;
            const sourceDocuments = parseClientSourceDocuments(
              project.uploadedFileName,
              project.uploadedFileUrl
            );

            const currentStageIdx = STAGE_ORDER.indexOf(project.stage);
            const hasUploadedFile = sourceDocuments.length > 0;

            return (
              <>
                {/* Multi-Project Switcher */}
                {data.projects.length > 1 && (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Your Projects ({data.projects.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.projects.map((item) => {
                        const isSelected = item.project.id === project.id;
                        return (
                          <button
                            key={item.project.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(item.project.id);
                              setUploadError(null);
                            }}
                            className={`px-3.5 py-2 border text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "border-tweaks-blue bg-blue-50/50 dark:bg-blue-950/30"
                                : "border-slate-200 dark:border-zinc-800 hover:border-slate-400"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-tweaks-blue">
                                {item.quote?.quoteNumber ||
                                  item.project.documentType}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {STAGE_LABELS[item.project.stage] ||
                                  item.project.stage}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-xs truncate mt-0.5">
                              {item.project.researchTitle}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ===========================================================
                    PRIMARY SECTION: MANUSCRIPT UPLOAD CARD
                   =========================================================== */}
                <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-tweaks-blue flex items-center gap-1.5">
                        <FileUp className="h-3.5 w-3.5" />
                        Your Documents for Editing
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {project.researchTitle}
                      </h1>
                    </div>

                    {hasUploadedFile ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start sm:self-center">
                        <CheckCircle2 className="h-4 w-4" />
                        {sourceDocuments.length === 1
                          ? "Manuscript Received"
                          : `${sourceDocuments.length} Documents Received`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold self-start sm:self-center">
                        <AlertTriangle className="h-4 w-4" />
                        Action Needed: Upload Document
                      </span>
                    )}
                  </div>

                  {!hasUploadedFile && (
                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
                      <div className="space-y-1">
                        <p className="font-bold">
                          Please upload the manuscript you would like us to
                          edit.
                        </p>
                        <p className="text-amber-800 dark:text-amber-300">
                          Your expected send date on the brief is{" "}
                          <strong>{project.expectedSendDate}</strong>. Uploading
                          here delivers the file directly to your project
                          workspace.
                        </p>
                      </div>
                    </div>
                  )}

                  {hasUploadedFile && (
                    <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Client Source Documents ({sourceDocuments.length})
                      </p>
                      <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                        {sourceDocuments.map((doc, idx) => {
                          const docDownloadUrl = doc.url
                            ? appendTokenIfNeeded(doc.url, accessToken)
                            : null;
                          return (
                            <div
                              key={`${doc.name}-${doc.url || idx}`}
                              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="h-9 w-9 bg-tweaks-blue/10 text-tweaks-blue flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {doc.name}
                                  </p>
                                  {doc.uploadedAt && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Uploaded{" "}
                                      {new Date(
                                        doc.uploadedAt
                                      ).toLocaleDateString("en-ZA")}
                                    </p>
                                  )}
                                  {!docDownloadUrl && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Submitted with your initial brief (email
                                      attachment).
                                    </p>
                                  )}
                                </div>
                              </div>

                              {docDownloadUrl && (
                                <a
                                  href={docDownloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {canUpload ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                      }}
                      onDrop={handleDrop}
                      onClick={() => {
                        if (!isUploading) fileInputRef.current?.click();
                      }}
                      className={`border-2 border-dashed p-6 sm:p-8 text-center transition-colors cursor-pointer ${
                        isDragging
                          ? "border-tweaks-blue bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-slate-300 dark:border-zinc-700 hover:border-tweaks-blue bg-slate-50/50 dark:bg-zinc-950/40"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_EXTENSIONS}
                        disabled={isUploading}
                        className="hidden"
                        onChange={(e) =>
                          void handleUploadFiles(e.target.files)
                        }
                      />

                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-tweaks-blue">
                          {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {isUploading
                              ? "Uploading your document(s)..."
                              : hasUploadedFile
                                ? "Upload Additional Document(s)"
                                : "Drag and drop your manuscript here, or click to browse"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Accepted formats: DOCX, DOC, PDF, TXT, RTF, ODT
                            (Maximum 50MB per file)
                          </p>
                        </div>
                        <Button
                          type="button"
                          disabled={isUploading}
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="rounded-none border-slate-300 dark:border-zinc-700 font-bold text-xs cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 mr-1.5" />
                              {hasUploadedFile
                                ? "Add Another Document"
                                : "Select Manuscript File"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                      Source document uploads are locked because editing for
                      this project has been completed. Contact{" "}
                      <a
                        href="mailto:hello@tweaks.co.za"
                        className="text-tweaks-blue font-bold hover:underline"
                      >
                        hello@tweaks.co.za
                      </a>{" "}
                      if you need to send additional files.
                    </div>
                  )}
                </section>

                {/* ===========================================================
                    LIVE PROJECT STATUS & DELIVERED WORK PACKAGE
                   =========================================================== */}
                <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-tweaks-blue">
                        Project Status &amp; Timeline
                      </span>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-3 py-1 bg-tweaks-blue text-white text-xs font-bold uppercase tracking-wider">
                          {STAGE_LABELS[project.stage] || project.stage}
                        </span>
                        {quote && (
                          <span className="text-xs font-mono text-slate-500">
                            Reference:{" "}
                            <strong className="text-slate-900 dark:text-white">
                              {quote.quoteNumber}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                      <div className="flex sm:justify-end items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-tweaks-blue" />
                        <span>Agreed Return Date:</span>
                        <strong className="text-slate-900 dark:text-white">
                          {project.requestedReturnDate}
                        </strong>
                      </div>
                      <div className="flex sm:justify-end items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-tweaks-blue" />
                        <span>Supervisor Sign-Off:</span>
                        <strong className="text-slate-900 dark:text-white">
                          {project.supervisorSignOff === "not_applicable"
                            ? "Not Applicable"
                            : project.supervisorSignOff === "yes"
                              ? project.supervisorSignOffReceivedAt
                                ? "Confirmed by Supervisor"
                                : "Confirmed by Student"
                              : "Pending / Disclaimer Acknowledged"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 5-Stage Progress Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {PORTAL_STAGE_STEPS.map((step) => {
                      const stepIdx = STAGE_ORDER.indexOf(step.key);
                      const isDone =
                        project.stage !== "lost" && currentStageIdx >= stepIdx;
                      return (
                        <div
                          key={step.key}
                          className={`p-3 border ${
                            isDone
                              ? "border-tweaks-blue bg-blue-50/50 dark:bg-blue-950/30 text-tweaks-blue font-bold"
                              : "border-slate-200 dark:border-zinc-800 text-slate-400"
                          }`}
                        >
                          {step.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivered Work Package (Shown when workReady = true) */}
                  {project.workReady && (
                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                      {project.releaseWork ? (
                        <div
                          onClick={() =>
                            void handleOpenPackage(
                              project.id,
                              quote?.token,
                              Boolean(project.clientOpenedAt)
                            )
                          }
                          className="p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                              <Unlock className="h-5 w-5" />
                              <span>Your Edited Work Package is Ready</span>
                            </div>
                            {project.reviewClosesAt && (
                              <span className="text-xs text-slate-600 dark:text-zinc-400">
                                72h Review Window Closes:{" "}
                                <strong className="text-slate-900 dark:text-white">
                                  {new Date(
                                    project.reviewClosesAt
                                  ).toLocaleString("en-ZA")}
                                </strong>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {project.editedDocUrl && (
                              <a
                                href={appendTokenIfNeeded(
                                  project.editedDocUrl,
                                  accessToken
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-tweaks-blue text-sm font-semibold"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-tweaks-blue" />
                                  Edited Document (Tracked Changes)
                                </span>
                                <ExternalLink className="h-4 w-4 text-slate-400" />
                              </a>
                            )}

                            {project.editingReportUrl && (
                              <a
                                href={appendTokenIfNeeded(
                                  project.editingReportUrl,
                                  accessToken
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-tweaks-blue text-sm font-semibold"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-tweaks-blue" />
                                  Editorial Report
                                </span>
                                <ExternalLink className="h-4 w-4 text-slate-400" />
                              </a>
                            )}

                            {includesReferencingReport &&
                              project.referencingReportUrl && (
                                <a
                                  href={appendTokenIfNeeded(
                                    project.referencingReportUrl,
                                    accessToken
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-tweaks-blue text-sm font-semibold"
                                >
                                  <span className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-tweaks-blue" />
                                    Referencing Report
                                  </span>
                                  <ExternalLink className="h-4 w-4 text-slate-400" />
                                </a>
                              )}

                            {project.walkthroughVideoUrl && (
                              <a
                                href={appendTokenIfNeeded(
                                  project.walkthroughVideoUrl,
                                  accessToken
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-tweaks-blue text-sm font-semibold"
                              >
                                <span className="flex items-center gap-2">
                                  <Video className="h-4 w-4 text-tweaks-red" />
                                  Editor Walkthrough Video
                                </span>
                                <ExternalLink className="h-4 w-4 text-slate-400" />
                              </a>
                            )}

                            {certificate && project.stage === "complete" && (
                              <Link
                                href={`/certificate/view/${certificate.id}`}
                                className="flex items-center justify-between p-3.5 bg-tweaks-blue text-white text-sm font-bold sm:col-span-2"
                              >
                                <span className="flex items-center gap-2">
                                  <Award className="h-4 w-4" />
                                  Download Official Completion Certificate (
                                  {certificate.id})
                                </span>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                              <Lock className="h-4 w-4" />
                              <span>
                                Your Editing is Complete — Balance Due to Unlock
                                Files
                              </span>
                            </div>
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                              {quote?.paymentOption === "institutional_funding"
                                ? "Your edited work will unlock automatically once your institution's Purchase Order number is logged."
                                : `Please settle the remaining balance of ${formatZarFromCents(
                                    quote?.balanceCents ?? 0
                                  )} to unlock your edited manuscript and reports immediately.`}
                            </p>
                          </div>
                          {quote && (
                            <Link
                              href={`/quote/${quote.token}`}
                              className="px-4 py-2.5 bg-tweaks-red hover:bg-tweaks-blue text-white text-xs font-bold shrink-0 text-center transition-colors"
                            >
                              Complete Payment / View Quote
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* ===========================================================
                    QUOTE, PAYMENT & BRIEF DETAILS GRID
                   =========================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Quote & Payment Summary */}
                  <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-tweaks-blue" />
                        Quote &amp; Payment Summary
                      </h2>
                      {quote && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {QUOTE_OUTCOME_LABELS[quote.outcome]}
                        </span>
                      )}
                    </div>

                    {quote ? (
                      <>
                        <dl className="space-y-2.5 text-xs">
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500">Quote Number</dt>
                            <dd className="font-mono font-bold text-slate-900 dark:text-white">
                              {quote.quoteNumber}
                            </dd>
                          </div>
                          {quote.validUntil && (
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">Valid Until</dt>
                              <dd className="font-mono">{quote.validUntil}</dd>
                            </div>
                          )}
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500">Payment Option</dt>
                            <dd className="font-semibold">
                              {PAYMENT_OPTION_LABELS[quote.paymentOption]}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-sm font-bold">
                            <dt>Total Fee (ZAR)</dt>
                            <dd className="font-mono">
                              {formatZarFromCents(quote.totalFeeCents)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2 text-emerald-600 font-bold">
                            <dt>Paid to Date</dt>
                            <dd className="font-mono">
                              {formatZarFromCents(quote.paidToDateCents)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2 text-sm font-black text-tweaks-blue pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <dt>Balance Due (ZAR)</dt>
                            <dd className="font-mono">
                              {formatZarFromCents(quote.balanceCents)}
                            </dd>
                          </div>
                        </dl>

                        {payments.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Recorded Payments
                            </p>
                            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                              {payments.map((pmt) => (
                                <div
                                  key={pmt.id}
                                  className="py-2 flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <span className="font-semibold uppercase">
                                      {pmt.paymentType.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-slate-500 ml-2">
                                      {pmt.paidAt
                                        ? new Date(
                                            pmt.paidAt
                                          ).toLocaleDateString("en-ZA")
                                        : ""}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-600">
                                    {formatZarFromCents(pmt.amountCents)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <Link
                            href={`/quote/${quote.token}`}
                            className="w-full py-3 px-4 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                            <span>
                              {quote.balanceCents > 0
                                ? "Accept Quote, Pay or Download PDF"
                                : "View Official Receipt & Invoice PDF"}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Your quotation is being prepared by our editorial team.
                      </p>
                    )}
                  </section>

                  {/* Right Column: Project Brief & Selected Services */}
                  <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-tweaks-blue" />
                        Project Brief &amp; Selected Services
                      </h2>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-tweaks-blue">
                        {project.deliverySpeed}
                      </span>
                    </div>

                    <dl className="space-y-2 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Institution</dt>
                        <dd className="font-semibold text-right">
                          {institutionName}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Degree &amp; Programme</dt>
                        <dd className="font-semibold text-right">
                          {formatDegreeSummary(
                            project.degreeLevel,
                            project.degreeProgramme
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Document Type</dt>
                        <dd className="font-semibold text-right">
                          {project.documentType} (
                          {project.wholeOrPart === "part"
                            ? `Part: ${project.whichPart || "Specified"}`
                            : "Whole document"}
                          )
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Volume</dt>
                        <dd className="font-mono text-right">
                          {project.pageCount} pages
                          {project.wordCount > 0
                            ? ` · ${project.wordCount.toLocaleString("en-ZA")} words`
                            : ""}
                          {project.referencePageCount > 0
                            ? ` (+ ${project.referencePageCount} ref p.)`
                            : ""}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Referencing Style</dt>
                        <dd className="font-semibold text-right">
                          {project.referencingStyle === "Other" &&
                          project.referencingStyleOther
                            ? project.referencingStyleOther
                            : project.referencingStyle}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Tracked Changes</dt>
                        <dd className="font-semibold text-right">
                          {project.trackedChanges === "Other" &&
                          project.trackedChangesOther
                            ? project.trackedChangesOther
                            : project.trackedChanges}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Expected Send Date</dt>
                        <dd className="font-mono text-right">
                          {project.expectedSendDate}
                        </dd>
                      </div>
                    </dl>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Selected Services
                      </p>
                      <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="py-2 flex items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {item.serviceName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {item.pricingBasis === "per_page"
                                  ? `${item.quantity} pages`
                                  : item.pricingBasis === "per_reference_page"
                                    ? `${item.quantity} reference pages`
                                    : "Flat fee"}
                              </p>
                            </div>
                            <span className="font-mono font-bold">
                              {formatZarFromCents(item.lineTotalCents)}
                            </span>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <p className="py-2 text-slate-500">
                            {project.documentType}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </>
            );
          })()
        )}
      </main>
    </div>
  );
}
