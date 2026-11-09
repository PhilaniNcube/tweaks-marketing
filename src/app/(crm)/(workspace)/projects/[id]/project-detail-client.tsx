"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Loader2,
  Banknote,
  Building2,
  UserCheck,
  FileText,
  Upload,
  Download,
} from "lucide-react";
import {
  formatZarFromCents,
  STAGE_LABELS,
  PAYMENT_OPTION_LABELS,
  QUOTE_OUTCOME_LABELS,
  getReturnScheduleStatus,
} from "@/components/crm/crm-helpers";
import {
  updateAdminProjectWorkflow,
  recordManualPayment,
  recordInstitutionalPurchaseOrder,
  assignProjectEditorAction,
  resolveDuplicateProjectFlag,
} from "@/app/actions/crm";
import type {
  ProjectStage,
  QuoteOutcome,
  WhyLost,
  Editor,
} from "@/db/schema";
import type { getAdminCrmDashboardData } from "@/app/actions/crm";
import { ProjectAdminActions } from "@/components/crm/project-admin-actions";
import { toast } from "sonner";

type DashboardData = Awaited<ReturnType<typeof getAdminCrmDashboardData>>;
type EnrichedProjectRow = DashboardData["rows"][number];

interface ProjectDetailClientProps {
  row: EnrichedProjectRow;
  editors: Editor[];
  isAdmin: boolean;
}

export function ProjectDetailClient({
  row,
  editors,
  isAdmin,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { project, client, quote, items, payments, certificate } = row;

  // Workflow & Handover Package State
  const [stage, setStage] = useState<ProjectStage>(project.stage);
  const [workReady, setWorkReady] = useState<boolean>(project.workReady);
  const [editedDocUrl, setEditedDocUrl] = useState(project.editedDocUrl || "");
  const [editingReportUrl, setEditingReportUrl] = useState(
    project.editingReportUrl || ""
  );
  const [referencingReportUrl, setReferencingReportUrl] = useState(
    project.referencingReportUrl || ""
  );
  const [walkthroughVideoUrl, setWalkthroughVideoUrl] = useState(
    project.walkthroughVideoUrl || ""
  );
  const [internalNotes, setInternalNotes] = useState(
    project.internalNotes || ""
  );
  const [quoteOutcome, setQuoteOutcome] = useState<QuoteOutcome>(
    quote?.outcome || "awaiting_reply"
  );
  const [whyLost, setWhyLost] = useState<WhyLost | "">(quote?.whyLost || "");

  // Payment & PO State
  const [payAmountRands, setPayAmountRands] = useState(
    quote ? String(Math.max(0, quote.balanceCents / 100)) : ""
  );
  const [payType, setPayType] = useState<
    | "deposit"
    | "instalment_1"
    | "instalment_2"
    | "instalment_3"
    | "full_payment"
    | "balance"
  >("full_payment");
  const [payMethod, setPayMethod] = useState<"eft" | "cash" | "other">("eft");
  const [payRef, setPayRef] = useState(quote?.quoteNumber || "");

  const [poNumber, setPoNumber] = useState(quote?.poNumber || "");
  const poDate = quote?.poDate || new Date().toISOString().split("T")[0];
  const [poTermsDays, setPoTermsDays] = useState<number>(
    quote?.paymentTermsDays || 30
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const handleR2Upload = async (
    slot:
      | "clientBrief"
      | "editedDoc"
      | "editingReport"
      | "referencingReport"
      | "walkthroughVideo",
    file: File | undefined
  ) => {
    if (!file) return;
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("projectId", project.id);
      fd.append("slot", slot);

      const res = await fetch("/api/r2/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "R2 upload failed");
      } else {
        if (slot === "editedDoc") setEditedDocUrl(json.url);
        if (slot === "editingReport") setEditingReportUrl(json.url);
        if (slot === "referencingReport") setReferencingReportUrl(json.url);
        if (slot === "walkthroughVideo") setWalkthroughVideoUrl(json.url);
        toast.success(`Uploaded ${file.name} to Cloudflare R2`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to upload file to Cloudflare R2");
    } finally {
      setUploadingSlot(null);
    }
  };

  const schedule = getReturnScheduleStatus(
    project.requestedReturnDate,
    project.stage
  );

  const copyUrl = (path: string, key: string) => {
    const full =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    navigator.clipboard.writeText(full);
    setCopiedKey(key);
    toast.success("Copied link to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateAdminProjectWorkflow({
        projectId: project.id,
        stage,
        workReady,
        editedDocUrl,
        editingReportUrl,
        referencingReportUrl,
        walkthroughVideoUrl,
        internalNotes,
        quoteOutcome,
        whyLost: whyLost ? (whyLost as WhyLost) : undefined,
      });
      if (res.success) {
        toast.success("Project workspace updated");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update project");
      }
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;
    startTransition(async () => {
      const res = await recordManualPayment({
        quoteId: quote.id,
        amountRands: Number(payAmountRands),
        paymentType: payType,
        method: payMethod,
        reference: payRef,
      });
      if (res.success) {
        toast.success("Payment logged & release gate recalculated");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to log payment");
      }
    });
  };

  const handleRecordPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;
    startTransition(async () => {
      const res = await recordInstitutionalPurchaseOrder({
        quoteId: quote.id,
        poNumber,
        poDate,
        paymentTermsDays: poTermsDays,
      });
      if (res.success) {
        toast.success("Institutional PO recorded & release gate opened");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save PO");
      }
    });
  };

  const handleEditorChange = (editorId: string) => {
    startTransition(async () => {
      const res = await assignProjectEditorAction({
        projectId: project.id,
        editorId: editorId === "unassigned" ? null : editorId,
      });
      if (res.success) {
        toast.success("Assigned editor updated");
        router.refresh();
      }
    });
  };

  const handleResolveDuplicate = () => {
    startTransition(async () => {
      const res = await resolveDuplicateProjectFlag(project.id);
      if (res.success) {
        toast.success("Duplicate submission flag resolved");
        router.refresh();
      }
    });
  };

  const cleanWhatsapp = (client?.whatsapp || "").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/projects"
            className="text-xs font-bold text-slate-500 hover:text-tweaks-blue inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects &amp; Pipeline
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {client
                ? `${client.firstName} ${client.surname}`
                : "Project Workspace"}
            </h1>
            {quote && (
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                {quote.quoteNumber}
              </span>
            )}
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-tweaks-blue text-white">
              {STAGE_LABELS[project.stage]}
            </span>
            {project.archivedAt && (
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                Archived
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            {project.researchTitle}
          </p>
        </div>

        {/* Shareable Client Quote / Status Portal Link */}
        {quote && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyUrl(`/quote/${quote.token}`, "quote")}
              className="px-3 py-2 text-xs font-bold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === "quote" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy Client Portal Link
            </button>
            <Link
              href={`/quote/${quote.token}`}
              target="_blank"
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-tweaks-blue flex items-center gap-1.5 transition-colors"
            >
              Open Client Page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Duplicate Flag Banner */}
      {project.isDuplicateFlag && !project.duplicateResolved && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>24-Hour Duplicate Submission Flagged:</strong> This client
              submitted another <em>{project.documentType}</em> brief within 24
              hours.
            </span>
          </div>
          <button
            type="button"
            onClick={handleResolveDuplicate}
            className="px-3 py-1.5 bg-amber-800 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Mark Flag Resolved
          </button>
        </div>
      )}

      {/* Project Administration: Archive / Restore / Delete */}
      <ProjectAdminActions
        projectId={project.id}
        archived={!!project.archivedAt}
        isAdmin={isAdmin}
        redirectTo="/projects"
      />

      {/* Main 3-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: Client Details, Delivery Schedule & Supervisor Sign-Off */}
        <div className="space-y-6">
          {/* Client Contact & Academic Context */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Client &amp; Academic Details
            </h2>

            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Client Name</dt>
                <dd className="font-bold text-right">
                  {client ? `${client.firstName} ${client.surname}` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-mono text-right">
                  {client?.email ? (
                    <a
                      href={`mailto:${client.email}`}
                      className="text-tweaks-blue hover:underline"
                    >
                      {client.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">WhatsApp</dt>
                <dd className="font-mono text-right">
                  {client?.whatsapp ? (
                    <a
                      href={`https://wa.me/${cleanWhatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      {client.whatsapp}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Institution</dt>
                <dd className="font-semibold text-right">
                  {row.institution ? (
                    <Link
                      href={`/institutions/${row.institution.id}`}
                      className="text-tweaks-blue hover:underline"
                    >
                      {row.institutionName}
                    </Link>
                  ) : (
                    row.institutionName
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Degree &amp; Programme</dt>
                <dd className="font-semibold text-right">
                  {project.degreeLevel} — {project.degreeProgramme}
                </dd>
              </div>
              {project.department && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Department</dt>
                  <dd className="text-right">{project.department}</dd>
                </div>
              )}
              {project.billingContactName && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Billing Contact</dt>
                  <dd className="text-right">
                    {project.billingContactName} ({project.billingContactEmail})
                  </dd>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <dt className="text-slate-500 mb-1">Research Title</dt>
                <dd className="font-bold text-slate-900 dark:text-white leading-snug">
                  {project.researchTitle}
                </dd>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <dt className="text-slate-500 mb-1">Main Goal &amp; Concerns</dt>
                <dd className="text-slate-700 dark:text-zinc-300">
                  {project.mainGoal}
                  {project.concerns ? ` — Concerns: ${project.concerns}` : ""}
                </dd>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <dt className="text-slate-500">Client Source Document (R2)</dt>
                <dd className="flex flex-wrap items-center justify-between gap-2">
                  {project.uploadedFileUrl ? (
                    <a
                      href={project.uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-tweaks-blue text-white text-[11px] font-bold inline-flex items-center gap-1.5 hover:bg-tweaks-red"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {project.uploadedFileName || "Download Client Document"}
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {project.uploadedFileName
                        ? `${project.uploadedFileName} (Email attachment)`
                        : "No file uploaded yet"}
                    </span>
                  )}

                  <label className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800">
                    <Upload className="h-3 w-3" />
                    {uploadingSlot === "clientBrief"
                      ? "Uploading..."
                      : "Upload to R2"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingSlot !== null}
                      onChange={(e) =>
                        handleR2Upload("clientBrief", e.target.files?.[0])
                      }
                    />
                  </label>
                </dd>
              </div>
            </dl>
          </div>

          {/* Delivery Schedule & Editor Assignment */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
              <span>Delivery Schedule &amp; Editor</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold ${
                  schedule.status === "late"
                    ? "bg-red-100 text-red-700"
                    : schedule.status === "due_soon"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {schedule.label}
              </span>
            </h2>

            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Delivery Speed</dt>
                <dd className="font-bold uppercase text-tweaks-blue">
                  {project.deliverySpeed}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Expected Send Date</dt>
                <dd className="font-mono">{project.expectedSendDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Requested Return Date</dt>
                <dd className="font-mono font-bold">
                  {project.requestedReturnDate}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Document Volume</dt>
                <dd className="font-mono">
                  {project.pageCount} pages ({project.referencePageCount} ref p.)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Referencing Style</dt>
                <dd className="font-semibold">{project.referencingStyle}</dd>
              </div>
            </dl>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-tweaks-blue" />
                Assigned Editor
              </label>
              <select
                disabled={isPending}
                value={project.assignedEditorId || "unassigned"}
                onChange={(e) => handleEditorChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
              >
                <option value="unassigned">Unassigned</option>
                {editors.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.name} ({ed.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supervisor Sign-Off & Scope Declaration Tracking */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-tweaks-blue" />
              Supervisor Sign-Off &amp; Scope Declaration
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ethical Scope Declaration</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Declared at: {new Date(project.scopeDeclaredAt).toLocaleString("en-ZA")}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-slate-500">Supervisor Sign-Off</span>
                {project.supervisorSignOffReceivedAt ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Token Confirmed
                  </span>
                ) : project.supervisorSignOff === "yes" ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800">
                    Student Self-Declared
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800">
                    Pending / Disclaimer Ack
                  </span>
                )}
              </div>

              {project.supervisorName && (
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Supervisor: <strong>{project.supervisorName}</strong> (
                  {project.supervisorEmail})
                </p>
              )}

              {project.supervisorSignOffToken && (
                <button
                  type="button"
                  onClick={() =>
                    copyUrl(
                      `/supervisor/sign-off/${project.supervisorSignOffToken}`,
                      "sup"
                    )
                  }
                  className="w-full mt-2 py-1.5 px-3 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50"
                >
                  <Copy className="h-3 w-3" />
                  Copy Supervisor Sign-Off Link
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Service Breakdown, Payments & Institutional PO */}
        <div className="space-y-6">
          {/* Service Selections & Fee Breakdown */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-tweaks-blue" />
                Service Selections &amp; Fee Breakdown
              </h2>
              {quote && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-zinc-800">
                  {QUOTE_OUTCOME_LABELS[quote.outcome]}
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {item.serviceName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Qty: {item.quantity} ×{" "}
                      {formatZarFromCents(item.unitStandardRateCents)}
                      {item.unitExpressSurchargeCents > 0
                        ? ` (+${formatZarFromCents(item.unitExpressSurchargeCents)} exp)`
                        : ""}
                    </p>
                  </div>
                  <span className="font-mono font-bold">
                    {formatZarFromCents(item.lineTotalCents)}
                  </span>
                </div>
              ))}
            </div>

            {quote && (
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Payment Option</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {PAYMENT_OPTION_LABELS[quote.paymentOption]}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>Total Quote Fee</span>
                  <span className="font-mono">
                    {formatZarFromCents(quote.totalFeeCents)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Paid to Date</span>
                  <span className="font-mono">
                    {formatZarFromCents(quote.paidToDateCents)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-600 font-black text-sm pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span>Balance Remaining</span>
                  <span className="font-mono">
                    {formatZarFromCents(quote.balanceCents)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Log Manual EFT / Payment */}
          {quote && (
            <form
              onSubmit={handleRecordPayment}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3"
            >
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-emerald-600" />
                Log EFT / Manual Payment
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Amount (ZAR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmountRands}
                    onChange={(e) => setPayAmountRands(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={payType}
                    onChange={(e) =>
                      setPayType(e.target.value as typeof payType)
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="full_payment">Full Payment</option>
                    <option value="deposit">50% Deposit</option>
                    <option value="instalment_1">Instalment 1</option>
                    <option value="instalment_2">Instalment 2</option>
                    <option value="instalment_3">Instalment 3</option>
                    <option value="balance">Final Balance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) =>
                      setPayMethod(e.target.value as "eft" | "cash" | "other")
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="eft">EFT Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Institutional / Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Bank Reference
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Record Payment &amp; Recalculate Gate
              </button>

              {payments.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Recorded Payments ({payments.length})
                  </p>
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-[11px] font-mono"
                    >
                      <span>
                        {p.receiptNumber || p.method.toUpperCase()} (
                        {p.paymentType})
                      </span>
                      <span className="font-bold text-emerald-600">
                        {formatZarFromCents(p.amountCents)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}

          {/* Institutional PO Recording (Option 3) */}
          {quote && (
            <form
              onSubmit={handleRecordPo}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3"
            >
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-purple-600" />
                Option 3: Institutional Purchase Order (PO)
              </h2>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Official PO Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PO-UCT-2026-881"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={poTermsDays}
                    onChange={(e) => setPoTermsDays(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Save PO &amp; Unlock Work Release Gate
              </button>
            </form>
          )}
        </div>

        {/* COLUMN 3: Work Release Gatekeeper, Handover Package & Certificate */}
        <div className="space-y-6">
          {/* Work Release Gatekeeper Status Banner */}
          <div
            className={`p-5 border space-y-2 ${
              project.releaseWork
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                {project.releaseWork ? (
                  <>
                    <Unlock className="h-4 w-4 text-emerald-600" />
                    Work Release Gate: OPEN
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-amber-600" />
                    Work Release Gate: LOCKED
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              {project.releaseWork
                ? "Balance is R0 (or an approved Institutional PO is logged). Once you mark 'Work Ready' below, the client can immediately download their edited files."
                : "Balance is still outstanding and no Institutional PO is recorded. Even if 'Work Ready' is ticked, download links remain locked on the client page until payment clears."}
            </p>
          </div>

          {/* Workflow Stage & Handover Package Form */}
          <form
            onSubmit={handleSaveWorkflow}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4"
          >
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Handover Package &amp; Stage Control
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Project Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as ProjectStage)}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold"
                >
                  {Object.entries(STAGE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Quote Outcome
                </label>
                <select
                  value={quoteOutcome}
                  onChange={(e) =>
                    setQuoteOutcome(e.target.value as QuoteOutcome)
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  {Object.entries(QUOTE_OUTCOME_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(quoteOutcome === "declined" ||
              quoteOutcome === "expired" ||
              stage === "lost") && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Why Lost / Declined Reason
                </label>
                <select
                  value={whyLost}
                  onChange={(e) => setWhyLost(e.target.value as WhyLost | "")}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="">Select reason...</option>
                  <option value="price">Price / Budget</option>
                  <option value="turnaround">Turnaround Time</option>
                  <option value="went_elsewhere">Went Elsewhere</option>
                  <option value="no_reply">No Reply</option>
                  <option value="scope_changed">Scope Changed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-2.5 p-3 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 cursor-pointer">
              <input
                type="checkbox"
                checked={workReady}
                onChange={(e) => setWorkReady(e.target.checked)}
                className="h-4 w-4 accent-tweaks-blue"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">
                  Mark Work Ready for Client Handover
                </p>
                <p className="text-[10px] text-slate-500">
                  Publishes package links (gated by releaseWork).
                </p>
              </div>
            </label>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    1. Edited Document (R2 Upload or URL)
                  </label>
                  <label className="text-[10px] font-bold text-tweaks-blue hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    {uploadingSlot === "editedDoc"
                      ? "Uploading..."
                      : "Upload File to R2"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingSlot !== null}
                      onChange={(e) =>
                        handleR2Upload("editedDoc", e.target.files?.[0])
                      }
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Upload to R2 or paste URL..."
                  value={editedDocUrl}
                  onChange={(e) => setEditedDocUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-[11px]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    2. Editing Report (R2 Upload or URL)
                  </label>
                  <label className="text-[10px] font-bold text-tweaks-blue hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    {uploadingSlot === "editingReport"
                      ? "Uploading..."
                      : "Upload File to R2"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingSlot !== null}
                      onChange={(e) =>
                        handleR2Upload("editingReport", e.target.files?.[0])
                      }
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Upload to R2 or paste URL..."
                  value={editingReportUrl}
                  onChange={(e) => setEditingReportUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-[11px]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    3. Referencing Report (R2 Upload or URL)
                  </label>
                  <label className="text-[10px] font-bold text-tweaks-blue hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    {uploadingSlot === "referencingReport"
                      ? "Uploading..."
                      : "Upload File to R2"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingSlot !== null}
                      onChange={(e) =>
                        handleR2Upload("referencingReport", e.target.files?.[0])
                      }
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Upload to R2 or paste URL..."
                  value={referencingReportUrl}
                  onChange={(e) => setReferencingReportUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-[11px]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    4. Walkthrough Video (R2 Upload or Loom/Drive URL)
                  </label>
                  <label className="text-[10px] font-bold text-tweaks-blue hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    {uploadingSlot === "walkthroughVideo"
                      ? "Uploading..."
                      : "Upload Video to R2"}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={uploadingSlot !== null}
                      onChange={(e) =>
                        handleR2Upload("walkthroughVideo", e.target.files?.[0])
                      }
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Upload video to R2 or paste Loom URL..."
                  value={walkthroughVideoUrl}
                  onChange={(e) => setWalkthroughVideoUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Workspace &amp; Handover Links
            </button>
          </form>

          {/* Completion Certificate Status */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="h-4 w-4 text-purple-600" />
              Academic Editing Certificate
            </h2>

            {certificate ? (
              <div className="space-y-2 text-xs">
                <p className="text-emerald-700 font-bold">
                  Certificate Issued: {certificate.id}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/certificate/view/${certificate.id}`}
                    target="_blank"
                    className="flex-1 py-2 px-3 bg-purple-700 text-white text-center font-bold text-xs hover:bg-purple-800"
                  >
                    View / Download PDF
                  </Link>
                  <Link
                    href={`/certificate/verify/${certificate.id}`}
                    target="_blank"
                    className="py-2 px-3 border border-slate-300 text-xs font-bold"
                  >
                    Verify Page
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Setting the project stage to <strong>Complete</strong> above
                automatically issues the official Completion Certificate with
                QR verification.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

