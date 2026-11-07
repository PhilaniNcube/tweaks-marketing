"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CalendarClock,
  Building2,
  PlusCircle,
  Search,
  AlertCircle,
} from "lucide-react";
import { formatZarFromCents } from "@/components/crm/crm-helpers";
import {
  recordManualPayment,
  recordInstitutionalPurchaseOrder,
} from "@/app/actions/crm";
import type { getAdminCrmDashboardData } from "@/app/actions/crm";
import { toast } from "sonner";

type DashboardData = Awaited<ReturnType<typeof getAdminCrmDashboardData>>;
type EnrichedProjectRow = DashboardData["rows"][number];

interface PaymentsClientProps {
  rows: EnrichedProjectRow[];
  kpis: DashboardData["kpis"];
}

export function PaymentsClient({ rows, kpis }: PaymentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "ledger" | "instalments" | "po_chasing"
  >("ledger");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);

  // Manual Payment Modal State
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(
    rows.find((r) => r.quote)?.quote?.id || ""
  );
  const [amountRands, setAmountRands] = useState("");
  const [paymentType, setPaymentType] = useState<
    | "deposit"
    | "instalment_1"
    | "instalment_2"
    | "instalment_3"
    | "full_payment"
    | "balance"
  >("full_payment");
  const [method, setMethod] = useState<"eft" | "cash" | "other">("eft");
  const [reference, setReference] = useState("");

  const todayIso = new Date().toISOString().split("T")[0];

  // Flatten all payments with project/client/quote context
  const allPayments = useMemo(() => {
    const list: Array<{
      payment: EnrichedProjectRow["payments"][number];
      row: EnrichedProjectRow;
    }> = [];
    for (const r of rows) {
      for (const p of r.payments) {
        list.push({ payment: p, row: r });
      }
    }
    list.sort((a, b) =>
      (b.payment.createdAt || "").localeCompare(a.payment.createdAt || "")
    );
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      ({ payment, row }) =>
        (payment.receiptNumber || "").toLowerCase().includes(q) ||
        (payment.paystackReference || "").toLowerCase().includes(q) ||
        (row.quote?.quoteNumber || "").toLowerCase().includes(q) ||
        (row.client
          ? `${row.client.firstName} ${row.client.surname}`.toLowerCase()
          : ""
        ).includes(q)
    );
  }, [rows, searchQuery]);

  // Option 2: Active Payment Plans
  const paymentPlanRows = useMemo(() => {
    return rows.filter(
      (r) => r.quote && r.quote.paymentOption === "payment_plan"
    );
  }, [rows]);

  // Option 3: Institutional POs
  const institutionalRows = useMemo(() => {
    return rows.filter(
      (r) => r.quote && r.quote.paymentOption === "institutional_funding"
    );
  }, [rows]);

  const handleLogPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteId) return;
    startTransition(async () => {
      const res = await recordManualPayment({
        quoteId: selectedQuoteId,
        amountRands: Number(amountRands),
        paymentType,
        method,
        reference,
      });
      if (res.success) {
        toast.success("Payment logged & reconciled");
        setShowLogPaymentModal(false);
        setAmountRands("");
        setReference("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to log payment");
      }
    });
  };

  const handleQuickSavePo = (quoteId: string, poNumber: string) => {
    startTransition(async () => {
      const res = await recordInstitutionalPurchaseOrder({
        quoteId,
        poNumber,
        poDate: todayIso,
        paymentTermsDays: 30,
      });
      if (res.success) {
        toast.success("PO recorded & work release gate opened");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update PO");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
            Financials &amp; Reconciliation
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Payments Ledger, Instalments &amp; PO Chasing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile Paystack &amp; EFT payments, track 2- and 3-month instalment plans, and chase Option 3 Institutional POs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogPaymentModal(true)}
          className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Log Manual EFT / Payment
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Collected
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatZarFromCents(kpis.totalPaidCents)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Outstanding
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {formatZarFromCents(kpis.totalOutstandingCents)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Unpaid Finished Work
          </span>
          <p className="text-2xl font-black text-red-600 mt-1">
            {formatZarFromCents(kpis.unpaidFinishedWorkCents)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Released on PO (Unpaid)
          </span>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {formatZarFromCents(kpis.releasedOnPoExposureCents)}
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`px-3.5 py-2 text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
              activeTab === "ledger"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Payments Ledger ({allPayments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("instalments")}
            className={`px-3.5 py-2 text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
              activeTab === "instalments"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Instalment Schedules ({paymentPlanRows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("po_chasing")}
            className={`px-3.5 py-2 text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
              activeTab === "po_chasing"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            PO Chasing ({institutionalRows.length})
          </button>
        </div>

        {activeTab === "ledger" && (
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt #, reference, client..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
        )}
      </div>

      {/* TAB 1: PAYMENTS LEDGER */}
      {activeTab === "ledger" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Receipt &amp; Reference</th>
                <th className="py-3 px-3">Client &amp; Project</th>
                <th className="py-3 px-3">Method &amp; Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status &amp; Date</th>
                <th className="py-3 px-4 text-right">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {allPayments.map(({ payment, row }) => (
                <tr key={payment.id}>
                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {payment.receiptNumber || "—"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Ref: {payment.paystackReference || "—"}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold">
                      {row.client
                        ? `${row.client.firstName} ${row.client.surname}`
                        : "Client"}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {row.quote?.quoteNumber}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase font-bold text-tweaks-blue">
                      {payment.method}
                    </span>{" "}
                    — {payment.paymentType.replace("_", " ")}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    {formatZarFromCents(payment.amountCents)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        payment.status === "success"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleString("en-ZA")
                        : new Date(payment.createdAt).toLocaleString("en-ZA")}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/projects/${row.project.id}`}
                      className="px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {allPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500 text-xs"
                  >
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: INSTALMENT SCHEDULES (OPTION 2) */}
      {activeTab === "instalments" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Client &amp; Quote</th>
                <th className="py-3 px-3">Plan Rule (2 vs 3 Months)</th>
                <th className="py-3 px-3">50% Deposit</th>
                <th className="py-3 px-3">Instalment Schedule</th>
                <th className="py-3 px-3">Balance Remaining</th>
                <th className="py-3 px-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {paymentPlanRows.map((row) => {
                const q = row.quote!;
                return (
                  <tr key={q.id}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold">
                        {row.client
                          ? `${row.client.firstName} ${row.client.surname}`
                          : "Client"}
                      </div>
                      <div className="text-[11px] font-mono text-tweaks-blue">
                        {q.quoteNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold">
                        {q.selectedInstalmentMonths}-Month Plan
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Max allowed: {q.maxInstalmentMonths}m (
                        {q.totalFeeCents < 300000 ? "< R3,000" : "≥ R3,000"})
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <div>Req: {formatZarFromCents(q.depositRequiredCents)}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Paid: {formatZarFromCents(q.paidToDateCents)}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] space-y-0.5">
                      <div>
                        M1: {formatZarFromCents(q.instalment1AmountCents)} (Due:{" "}
                        {q.instalment1DueDate || "After deposit"})
                      </div>
                      {q.instalment2AmountCents && (
                        <div>
                          M2: {formatZarFromCents(q.instalment2AmountCents)}{" "}
                          (Due: {q.instalment2DueDate || "Month 2"})
                        </div>
                      )}
                      {q.instalment3AmountCents && (
                        <div>
                          M3: {formatZarFromCents(q.instalment3AmountCents)}{" "}
                          (Due: {q.instalment3DueDate || "Month 3"})
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-600">
                      {formatZarFromCents(q.balanceCents)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/projects/${row.project.id}`}
                        className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {paymentPlanRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500 text-xs"
                  >
                    No Option 2 payment plan quotes active yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: INSTITUTIONAL PO CHASING (OPTION 3) */}
      {activeTab === "po_chasing" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Client &amp; Institution</th>
                <th className="py-3 px-3">Billing Contact &amp; Dept</th>
                <th className="py-3 px-3">PO Number &amp; Status</th>
                <th className="py-3 px-3">Invoice Due Date</th>
                <th className="py-3 px-3">Outstanding Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {institutionalRows.map((row) => {
                const q = row.quote!;
                const isOverdue =
                  Boolean(q.invoiceDueDate && q.invoiceDueDate < todayIso) &&
                  q.balanceCents > 0;
                return (
                  <tr key={q.id}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold">
                        {row.client
                          ? `${row.client.firstName} ${row.client.surname}`
                          : "Client"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {row.institutionName} ({q.quoteNumber})
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold">
                        {row.project.billingContactName || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {row.project.billingContactEmail || ""}{" "}
                        {row.project.department
                          ? `• ${row.project.department}`
                          : ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {q.poNumber ? (
                        <div>
                          <span className="font-mono font-bold text-purple-700">
                            {q.poNumber}
                          </span>
                          <div className="text-[10px] text-emerald-700 font-bold">
                            Release Gate Unlocked
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const entered = prompt("Enter Official PO Number:");
                            if (entered?.trim()) {
                              handleQuickSavePo(q.id, entered.trim());
                            }
                          }}
                          className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold cursor-pointer"
                        >
                          + Record PO Number
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <div>{q.invoiceDueDate || "Awaiting PO"}</div>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-red-700 bg-red-100 px-1.5 py-0.5 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> Overdue (30d terms)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-purple-700">
                      {formatZarFromCents(q.balanceCents)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/projects/${row.project.id}`}
                        className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold"
                      >
                        Workspace
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {institutionalRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500 text-xs"
                  >
                    No Option 3 Institutional PO quotes active yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Log Manual EFT Payment */}
      {showLogPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleLogPayment}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-xl"
          >
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Log Manual EFT / Cash Payment
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Select Quote / Project *
                </label>
                <select
                  required
                  value={selectedQuoteId}
                  onChange={(e) => setSelectedQuoteId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  {rows
                    .filter((r) => r.quote)
                    .map((r) => (
                      <option key={r.quote!.id} value={r.quote!.id}>
                        {r.quote!.quoteNumber} —{" "}
                        {r.client
                          ? `${r.client.firstName} ${r.client.surname}`
                          : "Client"}{" "}
                        (Bal: {formatZarFromCents(r.quote!.balanceCents)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Amount Received (ZAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountRands}
                    onChange={(e) => setAmountRands(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) =>
                      setPaymentType(e.target.value as typeof paymentType)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="full_payment">Full Payment</option>
                    <option value="deposit">50% Deposit</option>
                    <option value="instalment_1">Instalment 1</option>
                    <option value="instalment_2">Instalment 2</option>
                    <option value="instalment_3">Instalment 3</option>
                    <option value="balance">Final Balance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) =>
                      setMethod(e.target.value as "eft" | "cash" | "other")
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
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
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. QT-2026-..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogPaymentModal(false)}
                className="px-4 py-2 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white cursor-pointer"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

