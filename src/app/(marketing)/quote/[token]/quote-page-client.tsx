"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Building2,
  Download,
  Share2,
  Lock,
  Unlock,
  FileText,
  Video,
  Award,
  ExternalLink,
  Loader2,
  Clock,
  Landmark,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatZarFromCents } from "@/lib/pricing/quote-calculator";
import {
  acceptQuoteAndSelectOption,
  recordClientOpenedPackage,
} from "@/app/actions/crm";
import type {
  Quote,
  Project,
  Client,
  QuoteItem,
  Payment,
  Certificate,
  PaymentOption,
} from "@/db/schema";
import { toast } from "sonner";

interface QuotePageClientProps {
  token: string;
  initialData: {
    quote: Quote;
    project: Project;
    client: Client;
    institutionName: string;
    items: QuoteItem[];
    payments: Payment[];
    certificate: Certificate | null;
    includesReferencingReport: boolean;
    isExpired: boolean;
    settings: Record<string, string>;
  };
}

const STAGE_LABELS: Record<string, string> = {
  enquiry: "Brief Received",
  quote_sent: "Quote Issued",
  accepted: "Quote Accepted",
  in_progress: "Editing in Progress",
  work_ready: "Editing Finished",
  review: "72-Hour Client Review",
  complete: "Project Completed",
  closed: "Closed",
  lost: "Closed",
};

export function QuotePageClient({ token, initialData }: QuotePageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    quote,
    project,
    client,
    institutionName,
    items,
    payments,
    certificate,
    includesReferencingReport,
    isExpired,
    settings,
  } = initialData;

  const [paymentOption, setPaymentOption] = useState<PaymentOption>(
    quote.paymentOption
  );
  const [selectedMonths, setSelectedMonths] = useState<number>(
    quote.selectedInstalmentMonths || quote.maxInstalmentMonths
  );
  const [department, setDepartment] = useState(project.department || "");
  const [billingContactName, setBillingContactName] = useState(
    project.billingContactName || ""
  );
  const [billingContactEmail, setBillingContactEmail] = useState(
    project.billingContactEmail || ""
  );

  const [isPaying, setIsPaying] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isVerifyingPaystack, setIsVerifyingPaystack] = useState(false);
  const [packageOpened, setPackageOpened] = useState(
    Boolean(project.clientOpenedAt)
  );

  // Automatically verify Paystack callback if ?reference=... is present
  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("trxref");
    const simulated = searchParams.get("simulated") === "true";
    if (!ref) return;

    setIsVerifyingPaystack(true);
    fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref, simulated }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          toast.success("Payment confirmed!", {
            description: `Reference ${ref} has been recorded and your balance updated.`,
          });
          router.replace(`/quote/${token}`);
          router.refresh();
        } else {
          toast.error("Payment verification incomplete", {
            description: res.error || "Please contact us if you were charged.",
          });
        }
      })
      .catch(() => {
        toast.error("Could not verify payment status.");
      })
      .finally(() => {
        setIsVerifyingPaystack(false);
      });
  }, [searchParams, router, token]);

  const fullName = `${client.firstName} ${client.surname}`.trim();
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quote/${quote.token}`
      : `https://www.tweaks.co.za/quote/${quote.token}`;

  const depositCents =
    paymentOption === "payment_plan"
      ? Math.round(quote.totalFeeCents * 0.5)
      : paymentOption === "institutional_funding"
        ? 0
        : quote.totalFeeCents;

  const remainingAfterDepositCents = quote.totalFeeCents - depositCents;
  const monthlyInstalmentCents =
    paymentOption === "payment_plan" && selectedMonths > 0
      ? Math.ceil(remainingAfterDepositCents / selectedMonths)
      : 0;

  const nextPayableAmountCents =
    quote.paidToDateCents === 0
      ? paymentOption === "payment_plan"
        ? depositCents
        : quote.totalFeeCents
      : quote.balanceCents;

  const handlePayWithPaystack = async (
    customType?:
      | "deposit"
      | "full_payment"
      | "instalment_1"
      | "instalment_2"
      | "instalment_3"
      | "balance"
  ) => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteToken: quote.token,
          paymentOption,
          selectedInstalmentMonths: selectedMonths,
          paymentType: customType,
        }),
      });
      const json = await res.json();
      if (json.success && json.authorizationUrl) {
        window.location.href = json.authorizationUrl;
      } else {
        toast.error(json.error || "Could not start Paystack payment.");
        setIsPaying(false);
      }
    } catch {
      toast.error("Network error starting Paystack payment.");
      setIsPaying(false);
    }
  };

  const handleAcceptInstitutionalOrPlan = async () => {
    if (paymentOption === "institutional_funding") {
      if (!department.trim() || !billingContactName.trim() || !billingContactEmail.trim()) {
        toast.error(
          "Please fill in the Department, Billing Contact Name, and Billing Contact Email."
        );
        return;
      }
    }
    setIsAccepting(true);
    const res = await acceptQuoteAndSelectOption({
      quoteToken: quote.token,
      paymentOption,
      selectedInstalmentMonths: selectedMonths,
      department,
      billingContactName,
      billingContactEmail,
    });
    setIsAccepting(false);
    if (res.success) {
      toast.success("Quote accepted!", {
        description:
          paymentOption === "institutional_funding"
            ? "Your institutional invoice details have been updated. Please share this quote PDF with your finance office to raise a Purchase Order."
            : "Your payment option has been saved.",
      });
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleOpenPackage = async () => {
    if (!packageOpened) {
      setPackageOpened(true);
      await recordClientOpenedPackage(quote.token);
      router.refresh();
    }
  };

  const handleShareWhatsApp = () => {
    const docLabel =
      quote.paidToDateCents > 0
        ? "Receipt & Project Status"
        : quote.outcome === "accepted"
          ? "Invoice & Quote"
          : "Quote";
    const text = `Tweaks Academic Editing ${docLabel} (${quote.quoteNumber}) — Total: ${formatZarFromCents(
      quote.totalFeeCents
    )} (ZAR). View, accept, or download here: ${pageUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Expired Quote View (when past validity date and unpaid/unaccepted)
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 text-center space-y-5">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Quote {quote.quoteNumber} Has Expired
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            This quotation was valid until <strong>{quote.validUntil}</strong>.
            Because editorial schedules and turnaround availability change
            daily, please request a refreshed quote and we will issue an
            updated link right away.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`/contact?pages=${project.pageCount}`}
              className="bg-tweaks-blue hover:bg-tweaks-red text-white px-6 py-3 text-sm font-bold transition-colors"
            >
              Request a Re-Quote
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Action Bar (Hidden when printing PDF) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-tweaks-blue text-white text-xs font-bold uppercase tracking-wider">
              {STAGE_LABELS[project.stage] || project.stage}
            </span>
            <span className="text-xs text-slate-500">
              Reference: <strong className="text-slate-900 dark:text-white">{quote.quoteNumber}</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-none text-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download PDF (Quote / Invoice / Receipt)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="rounded-none text-xs cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Send via WhatsApp
            </Button>
          </div>
        </div>

        {isVerifyingPaystack && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 flex items-center gap-3 text-sm text-tweaks-blue">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Verifying your Paystack payment...</span>
          </div>
        )}

        {/* ===================================================================
            PHASE 5: PROJECT STATUS & HANDOVER PACKAGE GATE
           =================================================================== */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-tweaks-blue">
                Live Project Tracker
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {project.researchTitle}
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500">
              <div>
                Agreed Return Date:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {project.requestedReturnDate}
                </strong>
              </div>
              <div>
                Supervisor Sign-Off:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {project.supervisorSignOff === "yes"
                    ? project.supervisorSignOffReceivedAt
                      ? "Confirmed by Supervisor"
                      : "Confirmed by Student"
                    : "Pending / Disclaimer Acknowledged"}
                </strong>
              </div>
            </div>
          </div>

          {/* Stage Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { key: "enquiry", label: "1. Quote Issued" },
              { key: "accepted", label: "2. Accepted & Booked" },
              { key: "in_progress", label: "3. Editing in Progress" },
              { key: "work_ready", label: "4. Work Ready" },
              { key: "complete", label: "5. Complete & Certified" },
            ].map((step, idx) => {
              const order = [
                "enquiry",
                "quote_sent",
                "accepted",
                "in_progress",
                "work_ready",
                "review",
                "complete",
              ];
              const currentIdx = order.indexOf(project.stage);
              const stepIdx = order.indexOf(step.key);
              const isDone = currentIdx >= stepIdx;
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

          {/* Delivery Package Section (Shown when editor marks workReady = true) */}
          {project.workReady && (
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
              {project.releaseWork ? (
                <div
                  onClick={handleOpenPackage}
                  className="p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <Unlock className="h-5 w-5" />
                      <span>Your Edited Work Package is Ready</span>
                    </div>
                    {project.reviewClosesAt && (
                      <span className="text-xs text-slate-500">
                        72h Review Window Closes:{" "}
                        <strong>
                          {new Date(project.reviewClosesAt).toLocaleString(
                            "en-ZA"
                          )}
                        </strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* 1. Edited document with tracked changes (Always) */}
                    {project.editedDocUrl && (
                      <a
                        href={
                          project.editedDocUrl.startsWith("/api/r2/download")
                            ? `${project.editedDocUrl}&token=${encodeURIComponent(quote.token)}`
                            : project.editedDocUrl
                        }
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

                    {/* 2. Editing Report (Always) */}
                    {project.editingReportUrl && (
                      <a
                        href={
                          project.editingReportUrl.startsWith("/api/r2/download")
                            ? `${project.editingReportUrl}&token=${encodeURIComponent(quote.token)}`
                            : project.editingReportUrl
                        }
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

                    {/* 3. Referencing Report (Only when Reference checking or Reference list editing was bought) */}
                    {includesReferencingReport && project.referencingReportUrl && (
                      <a
                        href={
                          project.referencingReportUrl.startsWith(
                            "/api/r2/download"
                          )
                            ? `${project.referencingReportUrl}&token=${encodeURIComponent(quote.token)}`
                            : project.referencingReportUrl
                        }
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

                    {/* 4. Walkthrough Video (Only where editor recorded one) */}
                    {project.walkthroughVideoUrl && (
                      <a
                        href={
                          project.walkthroughVideoUrl.startsWith(
                            "/api/r2/download"
                          )
                            ? `${project.walkthroughVideoUrl}&token=${encodeURIComponent(quote.token)}`
                            : project.walkthroughVideoUrl
                        }
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

                    {/* 5. Completion Certificate (Issued when stage reaches Complete) */}
                    {certificate && project.stage === "complete" && (
                      <Link
                        href={`/certificate/view/${certificate.id}`}
                        className="flex items-center justify-between p-3.5 bg-tweaks-blue text-white text-sm font-bold sm:col-span-2"
                      >
                        <span className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Download Official Completion Certificate ({certificate.id})
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
                        Your Editing is Complete — Balance Due to Unlock Files
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {quote.paymentOption === "institutional_funding"
                        ? "Your edited work will unlock automatically as soon as your institution's Purchase Order number is logged."
                        : `Please settle the remaining balance of ${formatZarFromCents(
                            quote.balanceCents
                          )} below to unlock your edited manuscript and reports immediately.`}
                    </p>
                  </div>
                  {quote.paymentOption !== "institutional_funding" && (
                    <Button
                      type="button"
                      onClick={() => handlePayWithPaystack("balance")}
                      disabled={isPaying}
                      className="bg-tweaks-red hover:bg-tweaks-blue text-white rounded-none font-bold shrink-0 cursor-pointer"
                    >
                      Pay Balance ({formatZarFromCents(quote.balanceCents)})
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===================================================================
            PRINTABLE QUOTE / INVOICE / RECEIPT DOCUMENT
           =================================================================== */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 sm:p-12 space-y-8 shadow-sm">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-slate-200 dark:border-zinc-800 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-tweaks-blue">
                Tweaks Academic Editing (tweaks.co.za)
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {quote.balanceCents === 0 && quote.paidToDateCents > 0
                  ? "OFFICIAL RECEIPT & TAX INVOICE"
                  : quote.outcome === "accepted" || quote.paidToDateCents > 0
                    ? "PROFORMA INVOICE & QUOTATION"
                    : "OFFICIAL QUOTATION"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                All amounts stated in South African Rand (ZAR)
              </p>
            </div>
            <div className="text-left sm:text-right space-y-1 text-xs">
              <div>
                <span className="text-slate-400">Quote / Payment Reference:</span>{" "}
                <strong className="text-sm text-slate-900 dark:text-white">
                  {quote.quoteNumber}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Issued Date:</span>{" "}
                <span>
                  {quote.sentAt
                    ? new Date(quote.sentAt).toLocaleDateString("en-ZA")
                    : new Date(quote.createdAt).toLocaleDateString("en-ZA")}
                </span>
              </div>
              {quote.validUntil && (
                <div>
                  <span className="text-slate-400">Valid Until:</span>{" "}
                  <span>{quote.validUntil}</span>
                </div>
              )}
              {quote.poNumber && (
                <div>
                  <span className="text-slate-400">Institutional PO #:</span>{" "}
                  <strong className="text-tweaks-blue">{quote.poNumber}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Addressed To (Institution if Option 3, else Student) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {paymentOption === "institutional_funding"
                  ? "Billed To (Institution)"
                  : "Prepared For"}
              </span>
              {paymentOption === "institutional_funding" ? (
                <>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {institutionName}
                  </p>
                  {department && <p className="text-xs">{department}</p>}
                  {billingContactName && (
                    <p className="text-xs">
                      Attn: {billingContactName} ({billingContactEmail})
                    </p>
                  )}
                  <p className="text-xs text-slate-500 pt-1">
                    Researcher: {fullName} ({client.email})
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    {institutionName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {client.email} | {client.whatsapp}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Manuscript Details
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {project.researchTitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                {[project.degreeLevel, project.degreeProgramme]
                  .filter(Boolean)
                  .join(" — ")}{" "}
                ({project.documentType})
              </p>
              <p className="text-xs text-slate-500">
                Volume: {project.wordCount.toLocaleString()} words (
                {project.pageCount} pages) | Delivery:{" "}
                <span className="uppercase font-semibold">
                  {quote.deliverySpeed}
                </span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Service</th>
                  <th className="py-3 px-4">Basis / Quantity</th>
                  <th className="py-3 px-4 text-right">Standard Rate</th>
                  <th className="py-3 px-4 text-right">Express Surcharge</th>
                  <th className="py-3 pl-4 text-right">Line Total (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 pr-4 font-semibold text-slate-900 dark:text-white">
                      {item.serviceName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {item.pricingBasis === "per_page"
                        ? `${item.quantity} pages`
                        : item.pricingBasis === "per_reference_page"
                          ? `${item.quantity} reference pages`
                          : "1 (Flat fee)"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {formatZarFromCents(item.unitStandardRateCents)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.unitExpressSurchargeCents > 0
                        ? formatZarFromCents(item.unitExpressSurchargeCents)
                        : "—"}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatZarFromCents(item.lineTotalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-t-2 border-slate-200 dark:border-zinc-800 pt-6">
            <div className="text-xs text-slate-500 space-y-1 max-w-sm">
              <p>
                <strong>Interactive Quote Link:</strong>{" "}
                <a href={pageUrl} className="text-tweaks-blue underline break-all">
                  {pageUrl}
                </a>
              </p>
              <p>
                Every downloaded PDF carries this link so you or your finance
                office can return to this page at any time.
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Subtotal (ZAR):</span>
                <span>{formatZarFromCents(quote.subtotalCents)}</span>
              </div>
              {quote.expressSurchargeCents > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Express Priority Surcharge:</span>
                  <span>{formatZarFromCents(quote.expressSurchargeCents)}</span>
                </div>
              )}
              {quote.discountCents > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatZarFromCents(quote.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-zinc-800 pt-2">
                <span>Total Fee (ZAR):</span>
                <span>{formatZarFromCents(quote.totalFeeCents)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Paid to Date:</span>
                <span>{formatZarFromCents(quote.paidToDateCents)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-tweaks-blue border-t border-slate-200 dark:border-zinc-800 pt-2">
                <span>Balance Due (ZAR):</span>
                <span>{formatZarFromCents(quote.balanceCents)}</span>
              </div>
            </div>
          </div>

          {/* Recorded Payments / Receipts Table */}
          {payments.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment History & Official Receipts
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400">
                    <th className="py-2">Date</th>
                    <th className="py-2">Receipt #</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Method / Reference</th>
                    <th className="py-2 text-right">Amount (ZAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {payments.map((pmt) => (
                    <tr key={pmt.id}>
                      <td className="py-2">
                        {pmt.paidAt
                          ? new Date(pmt.paidAt).toLocaleDateString("en-ZA")
                          : "—"}
                      </td>
                      <td className="py-2 font-semibold">
                        {pmt.receiptNumber || "—"}
                      </td>
                      <td className="py-2 uppercase">{pmt.paymentType}</td>
                      <td className="py-2">
                        {pmt.method.toUpperCase()} ({pmt.paystackReference})
                      </td>
                      <td className="py-2 text-right font-bold text-emerald-600">
                        {formatZarFromCents(pmt.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================================
            INTERACTIVE ACCEPTANCE & PAYMENT SECTION (Paystack + EFT + PO)
           =================================================================== */}
        {quote.balanceCents > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 print:hidden">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Accept Quote & Complete Payment
            </h3>

            {/* Payment Option Picker (editable before first payment) */}
            {quote.paidToDateCents === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label
                  className={`p-4 border cursor-pointer ${
                    paymentOption === "full_payment"
                      ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <input
                      type="radio"
                      checked={paymentOption === "full_payment"}
                      onChange={() => setPaymentOption("full_payment")}
                    />
                    <span>1. Full Payment</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay {formatZarFromCents(quote.totalFeeCents)} upfront.
                  </p>
                </label>

                <label
                  className={`p-4 border cursor-pointer ${
                    paymentOption === "payment_plan"
                      ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <input
                      type="radio"
                      checked={paymentOption === "payment_plan"}
                      onChange={() => setPaymentOption("payment_plan")}
                    />
                    <span>2. 50% Deposit Plan</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay {formatZarFromCents(depositCents)} deposit now + balance
                    over up to {quote.maxInstalmentMonths} months.
                  </p>
                </label>

                <label
                  className={`p-4 border cursor-pointer ${
                    paymentOption === "institutional_funding"
                      ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <input
                      type="radio"
                      checked={paymentOption === "institutional_funding"}
                      onChange={() => setPaymentOption("institutional_funding")}
                    />
                    <span>3. Institutional PO</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    University finance office pays against a Purchase Order.
                  </p>
                </label>
              </div>
            )}

            {/* Conditional 2 vs 3 Month Schedule Details for Option 2 */}
            {paymentOption === "payment_plan" && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <strong className="uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Instalment Plan ({selectedMonths} Months):
                    </strong>{" "}
                    <span className="text-slate-500">
                      50% Deposit ({formatZarFromCents(depositCents)}) +{" "}
                      {selectedMonths} monthly payments of{" "}
                      {formatZarFromCents(monthlyInstalmentCents)}
                    </span>
                  </div>
                  {quote.maxInstalmentMonths === 3 &&
                    quote.paidToDateCents === 0 && (
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            checked={selectedMonths === 2}
                            onChange={() => setSelectedMonths(2)}
                          />
                          <span>2 Months</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            checked={selectedMonths === 3}
                            onChange={() => setSelectedMonths(3)}
                          />
                          <span>3 Months</span>
                        </label>
                      </div>
                    )}
                </div>
                {quote.instalment1DueDate && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <div>
                      Instalment 1 Due:{" "}
                      <strong>{quote.instalment1DueDate}</strong> (
                      {formatZarFromCents(quote.instalment1AmountCents || 0)})
                    </div>
                    {quote.instalment2DueDate && (
                      <div>
                        Instalment 2 Due:{" "}
                        <strong>{quote.instalment2DueDate}</strong> (
                        {formatZarFromCents(quote.instalment2AmountCents || 0)})
                      </div>
                    )}
                    {quote.instalment3DueDate && (
                      <div>
                        Instalment 3 Due:{" "}
                        <strong>{quote.instalment3DueDate}</strong> (
                        {formatZarFromCents(quote.instalment3AmountCents || 0)})
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Option 3: Institutional Funding Flow */}
            {paymentOption === "institutional_funding" ? (
              <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-tweaks-blue shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {settings.institutional_release_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-bold">Department</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Department / Faculty"
                      className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold">
                      Billing Contact Name
                    </Label>
                    <Input
                      value={billingContactName}
                      onChange={(e) => setBillingContactName(e.target.value)}
                      placeholder="Finance Officer"
                      className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold">
                      Billing Contact Email
                    </Label>
                    <Input
                      value={billingContactEmail}
                      onChange={(e) => setBillingContactEmail(e.target.value)}
                      placeholder="finance@university.ac.za"
                      className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAcceptInstitutionalOrPlan}
                  disabled={isAccepting}
                  className="bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none font-bold cursor-pointer"
                >
                  {isAccepting
                    ? "Saving Institutional Details..."
                    : "Confirm Institutional Quote & Download PDF for Finance Office"}
                </Button>
              </div>
            ) : (
              /* Paystack Online Checkout + Bank EFT Instructions Side-by-Side */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Paystack Card / Instant EFT */}
                <div className="p-5 border border-tweaks-blue bg-blue-50/20 dark:bg-blue-950/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <CreditCard className="h-5 w-5 text-tweaks-blue" />
                      <span>Pay Online via Paystack (Instant Release)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Secure South African & international card payment or
                      instant EFT processed in ZAR. Automatically updates your
                      receipt and project tracker immediately.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handlePayWithPaystack()}
                    disabled={isPaying}
                    className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white rounded-none py-6 font-bold cursor-pointer"
                  >
                    {isPaying ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {quote.paidToDateCents === 0 &&
                    paymentOption === "payment_plan"
                      ? `Accept & Pay 50% Deposit (${formatZarFromCents(
                          depositCents
                        )})`
                      : `Accept & Pay ${formatZarFromCents(
                          nextPayableAmountCents
                        )} via Paystack`}
                  </Button>
                </div>

                {/* Bank Transfer (EFT) Instructions */}
                <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Landmark className="h-5 w-5 text-slate-600" />
                    <span>Or Pay via EFT / Bank Transfer</span>
                  </div>
                  <p className="text-slate-500">
                    Use your Quote Number as the mandatory bank payment
                    reference so we can reconcile your transfer cleanly:
                  </p>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 font-mono">
                    <div>
                      <strong>Payment Reference:</strong>{" "}
                      <span className="text-tweaks-red font-bold">
                        {quote.quoteNumber}
                      </span>
                    </div>
                    <div>
                      <strong>Account Name:</strong> Tweaks Academic Editing
                    </div>
                    <div>
                      <strong>Amount (ZAR):</strong>{" "}
                      {formatZarFromCents(nextPayableAmountCents)}
                    </div>
                    <div>
                      <strong>Proof of Payment:</strong> hello@tweaks.co.za
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
