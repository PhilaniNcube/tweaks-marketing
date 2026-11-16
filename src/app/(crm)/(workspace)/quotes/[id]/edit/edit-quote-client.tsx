"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { calculateQuoteFromCatalog } from "@/lib/pricing/quote-calculator";
import { formatZarFromCents } from "@/components/crm/crm-helpers";
import { updateQuoteScopeAction } from "@/app/actions/crm";
import type {
  DegreeLevel,
  PaymentOption,
  RateCardRule,
  Service,
} from "@/db/schema";
import type { getAdminCrmDashboardData } from "@/app/actions/crm";
import { toast } from "sonner";

type DashboardData = Awaited<ReturnType<typeof getAdminCrmDashboardData>>;
type EnrichedProjectRow = DashboardData["rows"][number];

interface EditQuoteClientProps {
  row: EnrichedProjectRow;
  services: Service[];
  rules: RateCardRule[];
  degreeLevels: DegreeLevel[];
}

export function EditQuoteClient({
  row,
  services,
  rules,
  degreeLevels,
}: EditQuoteClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { project, client, items } = row;
  const quote = row.quote!;

  // Resolve the services on the original quote against the active catalog.
  const initialSelectedServices = (() => {
    const names = items
      .map(
        (item) =>
          services.find((svc) => svc.id === item.serviceId)?.name ??
          services.find((svc) => svc.name === item.serviceName)?.name
      )
      .filter((name): name is string => Boolean(name));

    if (names.length > 0) return Array.from(new Set(names));
    return services[0] ? [services[0].name] : [];
  })();

  const missingServiceNames = items
    .filter(
      (item) =>
        !services.some(
          (svc) => svc.id === item.serviceId || svc.name === item.serviceName
        )
    )
    .map((item) => item.serviceName);

  const initialCalculatedPages = Math.max(
    1,
    Math.ceil((project.wordCount || 300) / 300)
  );

  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialSelectedServices
  );
  const [wordCount, setWordCount] = useState<number>(project.wordCount || 0);
  const [pageCountOverride, setPageCountOverride] = useState<number | null>(
    project.pageCount === initialCalculatedPages ? null : project.pageCount
  );
  const [referencePageCount, setReferencePageCount] = useState<number>(
    project.referencePageCount || 0
  );
  const [degreeLevel, setDegreeLevel] = useState(
    project.degreeLevel || degreeLevels[0]?.designator || "N/A"
  );
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">(
    project.deliverySpeed === "express" ? "express" : "standard"
  );
  const [paymentOption, setPaymentOption] = useState<PaymentOption>(
    quote.paymentOption
  );
  const [selectedInstalmentMonths, setSelectedInstalmentMonths] = useState(
    quote.selectedInstalmentMonths || quote.maxInstalmentMonths
  );
  const [validUntil, setValidUntil] = useState(quote.validUntil || "");
  const [requestedReturnDate, setRequestedReturnDate] = useState(
    project.requestedReturnDate || ""
  );
  const [reissue, setReissue] = useState(false);
  const [changeReason, setChangeReason] = useState("");

  const calculatedPages = Math.max(1, Math.ceil((wordCount || 300) / 300));
  const effectivePageCount = pageCountOverride ?? calculatedPages;

  const degreeLevelOptions = useMemo(() => {
    const options = degreeLevels.map((level) => level.designator);
    if (degreeLevel && !options.includes(degreeLevel)) {
      options.push(degreeLevel);
    }
    if (!options.includes("N/A")) {
      options.push("N/A");
    }
    return options;
  }, [degreeLevels, degreeLevel]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.length > 1
          ? prev.filter((service) => service !== serviceName)
          : prev
        : [...prev, serviceName]
    );
  };

  const liveQuote = useMemo(() => {
    return calculateQuoteFromCatalog(
      {
        selectedServices,
        pageCount: effectivePageCount,
        referencePageCount,
        wordCount,
        deliverySpeed,
        paymentOption,
        requestedInstalmentMonths: selectedInstalmentMonths,
        degreeLevel,
      },
      services,
      rules
    );
  }, [
    selectedServices,
    effectivePageCount,
    referencePageCount,
    wordCount,
    deliverySpeed,
    paymentOption,
    selectedInstalmentMonths,
    degreeLevel,
    services,
    rules,
  ]);

  const deltaCents = liveQuote.totalFeeCents - quote.totalFeeCents;
  const hasPayments = quote.paidToDateCents > 0;
  const belowPaidAmount = liveQuote.totalFeeCents < quote.paidToDateCents;
  const canSubmit = selectedServices.length > 0 && !belowPaidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error("Select at least one service to quote.");
      return;
    }
    if (belowPaidAmount) {
      toast.error(
        "The revised total cannot be lower than the amount already paid."
      );
      return;
    }

    startTransition(async () => {
      const res = await updateQuoteScopeAction({
        quoteId: quote.id,
        services: selectedServices,
        degreeLevel,
        wordCount,
        pageCount: effectivePageCount,
        referencePageCount,
        deliverySpeed,
        paymentOption,
        selectedInstalmentMonths: liveQuote.selectedInstalmentMonths,
        validUntil,
        requestedReturnDate,
        reissue,
        changeReason,
      });

      if (res.success) {
        toast.success(
          reissue
            ? `${res.quoteNumber} revised and re-issued to the client`
            : `${res.quoteNumber} revised`,
          {
            description: `New total: ${formatZarFromCents(res.totalFeeCents)}`,
          }
        );
        router.push("/quotes");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update the quote");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/quotes"
            className="text-xs font-bold text-slate-500 hover:text-tweaks-blue inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Quotes
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
            Revise Quote
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Edit {quote.quoteNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            {client ? `${client.firstName} ${client.surname}` : "Client"} ·{" "}
            {project.researchTitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/quote/${quote.token}`}
            target="_blank"
            className="px-3 py-2 text-xs font-bold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 flex items-center gap-1.5"
          >
            Open Client Quote <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/projects/${project.id}`}
            className="px-3 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-tweaks-blue"
          >
            Project
          </Link>
        </div>
      </div>

      {/* Guard rails */}
      {hasPayments && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Payments already recorded:</strong>{" "}
            {formatZarFromCents(quote.paidToDateCents)} has been paid against
            this quote. Recorded payments are preserved and the balance will be
            recalculated. The revised total cannot be lower than the amount
            already paid.
          </span>
        </div>
      )}

      {missingServiceNames.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Retired service detected:</strong>{" "}
            {missingServiceNames.join(", ")} is no longer in the active catalog
            and cannot be re-quoted. Select a replacement service below.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Revised Scope */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              1. Revised Scope &amp; Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Word Count *
                </label>
                <input
                  type="number"
                  min={0}
                  value={wordCount}
                  onChange={(e) => {
                    setWordCount(Number(e.target.value) || 0);
                    setPageCountOverride(null);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Auto-calculates at 300 words/page ({calculatedPages} pages)
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Billable Page Count *
                </label>
                <input
                  type="number"
                  min={1}
                  value={effectivePageCount}
                  onChange={(e) =>
                    setPageCountOverride(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Reference List Pages (0–500)
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={referencePageCount}
                  onChange={(e) =>
                    setReferencePageCount(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Services *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {services.map((service) => {
                  const checked = selectedServices.includes(service.name);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.name)}
                      className={`p-3 text-left border text-xs flex items-start justify-between cursor-pointer transition-colors ${
                        checked
                          ? "border-tweaks-blue bg-tweaks-blue/5"
                          : "border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {service.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Std: {formatZarFromCents(service.standardRateCents)} |
                          Exp: +{formatZarFromCents(service.expressSurchargeCents)}
                        </p>
                      </div>
                      {checked && (
                        <CheckCircle2 className="h-4 w-4 text-tweaks-blue shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Delivery Speed
                </label>
                <select
                  value={deliverySpeed}
                  onChange={(e) =>
                    setDeliverySpeed(e.target.value as "standard" | "express")
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold"
                >
                  <option value="standard">Standard Turnaround</option>
                  <option value="express">Express Turnaround</option>
                </select>
                <span className="text-[10px] text-slate-400">
                  {liveQuote.turnaround.displayLabel}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Degree Level
                </label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  {degreeLevelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Payment Option & Validity */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              2. Payment Option &amp; Validity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Payment Option
                </label>
                <select
                  value={paymentOption}
                  onChange={(e) =>
                    setPaymentOption(e.target.value as PaymentOption)
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  <option value="full_payment">Option 1: Full Payment</option>
                  <option value="payment_plan">
                    Option 2: 50% Deposit + Plan (Max{" "}
                    {liveQuote.maxInstalmentMonths}m)
                  </option>
                  <option value="institutional_funding">
                    Option 3: Institutional PO
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Requested Return Date
                </label>
                <input
                  type="date"
                  value={requestedReturnDate}
                  onChange={(e) => setRequestedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>

              {paymentOption === "payment_plan" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Instalments After Deposit
                  </label>
                  <select
                    value={liveQuote.selectedInstalmentMonths}
                    onChange={(e) =>
                      setSelectedInstalmentMonths(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                  >
                    {Array.from(
                      { length: liveQuote.maxInstalmentMonths },
                      (_, index) => index + 1
                    ).map((months) => (
                      <option key={months} value={months}>
                        {months} monthly instalment{months === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 p-3 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 cursor-pointer">
              <input
                type="checkbox"
                checked={reissue}
                onChange={(e) => setReissue(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-xs text-slate-600 dark:text-zinc-300">
                <strong>Re-issue to client.</strong> Resets the quote to
                Awaiting Reply and restarts the validity window from today. The
                client&apos;s existing quote link stays the same.
              </span>
            </label>
          </div>

          {/* 3. Revision Note */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              3. Internal Revision Note
            </h2>
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              Reason for Change (Optional)
            </label>
            <textarea
              rows={2}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. Client corrected the manuscript to 18,500 words and added reference checking."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
            <p className="text-[10px] text-slate-400">
              Appended to the project&apos;s internal notes for an audit trail.
            </p>
          </div>
        </div>

        {/* Live revised quote summary */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5 sticky top-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Calculator className="h-4 w-4 text-tweaks-blue" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Revised Quote
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            {liveQuote.items.map((item) => (
              <div
                key={item.serviceId}
                className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/70 pb-2"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">
                    {item.serviceName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Qty: {item.quantity} ({item.pricingBasis.replace("_", " ")})
                  </p>
                </div>
                <span className="font-mono font-bold">
                  {formatZarFromCents(item.lineTotalCents)}
                </span>
              </div>
            ))}
            {liveQuote.items.length === 0 && (
              <p className="text-slate-500">Select at least one service.</p>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Standard Subtotal</span>
              <span className="font-mono">
                {formatZarFromCents(liveQuote.subtotalCents)}
              </span>
            </div>
            {liveQuote.expressSurchargeCents > 0 && (
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Express Surcharge</span>
                <span className="font-mono">
                  +{formatZarFromCents(liveQuote.expressSurchargeCents)}
                </span>
              </div>
            )}
            {liveQuote.discountCents > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span className="font-mono">
                  −{formatZarFromCents(liveQuote.discountCents)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-zinc-800">
              <span>Total Quote Fee</span>
              <span className="font-mono text-tweaks-blue">
                {formatZarFromCents(liveQuote.totalFeeCents)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Current quote</span>
              <span className="font-mono">
                {formatZarFromCents(quote.totalFeeCents)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span>Difference</span>
              <span
                className={`font-mono ${
                  deltaCents === 0
                    ? "text-slate-500"
                    : deltaCents > 0
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {deltaCents > 0 ? "+" : deltaCents < 0 ? "−" : ""}
                {formatZarFromCents(Math.abs(deltaCents))}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1">
            <p className="font-bold text-slate-700 dark:text-zinc-300">
              Upfront Required
            </p>
            <p className="font-mono font-bold text-slate-800 dark:text-zinc-200">
              {formatZarFromCents(liveQuote.depositRequiredCents)} (
              {liveQuote.depositPercentage}%)
            </p>
            {hasPayments && (
              <>
                <p className="text-slate-500 pt-1">
                  Paid to date:{" "}
                  <span className="font-mono">
                    {formatZarFromCents(quote.paidToDateCents)}
                  </span>
                </p>
                <p className="text-slate-500">
                  Balance after revision:{" "}
                  <span className="font-mono font-bold">
                    {formatZarFromCents(
                      Math.max(
                        0,
                        liveQuote.totalFeeCents - quote.paidToDateCents
                      )
                    )}
                  </span>
                </p>
              </>
            )}
          </div>

          {belowPaidAmount && (
            <p className="text-[11px] font-bold text-red-600">
              The revised total is below the amount already paid. Adjust the
              payments before reducing the quote.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !canSubmit}
            className="w-full py-3.5 px-4 bg-tweaks-blue hover:bg-tweaks-red disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending
              ? "Saving Revision..."
              : reissue
                ? "Save & Re-issue Quote"
                : "Save Revised Quote"}
          </button>
        </div>
      </form>
    </div>
  );
}
