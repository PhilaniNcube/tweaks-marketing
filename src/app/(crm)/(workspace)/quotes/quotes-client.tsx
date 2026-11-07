"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  formatZarFromCents,
  QUOTE_OUTCOME_LABELS,
  PAYMENT_OPTION_LABELS,
} from "@/components/crm/crm-helpers";
import { updateQuoteOutcomeAction } from "@/app/actions/crm";
import type { QuoteOutcome, WhyLost } from "@/db/schema";
import type { getAdminCrmDashboardData } from "@/app/actions/crm";
import { toast } from "sonner";

type DashboardData = Awaited<ReturnType<typeof getAdminCrmDashboardData>>;
type EnrichedProjectRow = DashboardData["rows"][number];

interface QuotesClientProps {
  rows: EnrichedProjectRow[];
}

export function QuotesClient({ rows }: QuotesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [modalOutcome, setModalOutcome] =
    useState<QuoteOutcome>("awaiting_reply");
  const [modalWhyLost, setModalWhyLost] = useState<WhyLost | "">("");
  const [modalWhyLostNotes, setModalWhyLostNotes] = useState("");
  const [modalValidUntil, setModalValidUntil] = useState("");

  const todayIso = new Date().toISOString().split("T")[0];

  const quoteRows = useMemo(() => {
    return rows
      .filter((r) => Boolean(r.quote))
      .filter((r) => {
        if (outcomeFilter !== "all" && r.quote?.outcome !== outcomeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const num = r.quote?.quoteNumber.toLowerCase() || "";
          const name = r.client
            ? `${r.client.firstName} ${r.client.surname}`.toLowerCase()
            : "";
          const title = r.project.researchTitle.toLowerCase();
          if (!num.includes(q) && !name.includes(q) && !title.includes(q)) {
            return false;
          }
        }
        return true;
      });
  }, [rows, outcomeFilter, searchQuery]);

  const openEditModal = (row: EnrichedProjectRow) => {
    if (!row.quote) return;
    setEditingQuoteId(row.quote.id);
    setModalOutcome(row.quote.outcome);
    setModalWhyLost(row.quote.whyLost || "");
    setModalWhyLostNotes(row.quote.whyLostNotes || "");
    setModalValidUntil(row.quote.validUntil || todayIso);
  };

  const handleSaveQuoteOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuoteId) return;
    startTransition(async () => {
      const res = await updateQuoteOutcomeAction({
        quoteId: editingQuoteId,
        outcome: modalOutcome,
        whyLost: modalWhyLost ? (modalWhyLost as WhyLost) : null,
        whyLostNotes: modalWhyLostNotes,
        validUntil: modalValidUntil,
      });
      if (res.success) {
        toast.success("Quote outcome updated");
        setEditingQuoteId(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update quote");
      }
    });
  };

  const copyQuoteUrl = (token: string, id: string) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/quote/${token}`
        : `/quote/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Client quote link copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
            Quote &amp; Conversion Tracker
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Quote Management ({quoteRows.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active and past quotes, monitor validity expiration windows, and capture &ldquo;Why lost&rdquo; reasons.
          </p>
        </div>
      </div>

      {/* Outcome Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "All Quotes"],
              ["awaiting_reply", "Awaiting Reply"],
              ["accepted", "Accepted"],
              ["declined", "Declined"],
              ["expired", "Expired"],
              ["draft", "Draft"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setOutcomeFilter(val)}
              className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
                outcomeFilter === val
                  ? "bg-tweaks-blue text-white border-tweaks-blue"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote #, client, research title..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Quote # &amp; Client</th>
              <th className="py-3 px-3">Payment Option &amp; Plan</th>
              <th className="py-3 px-3">Total Fee / Balance</th>
              <th className="py-3 px-3">Expiration Window</th>
              <th className="py-3 px-3">Outcome &amp; Why Lost</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {quoteRows.map((row) => {
              const q = row.quote!;
              const isPastValidUntil =
                Boolean(q.validUntil && q.validUntil < todayIso) &&
                q.outcome === "awaiting_reply";

              return (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                >
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-mono font-bold text-tweaks-blue">
                      {q.quoteNumber}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {row.client
                        ? `${row.client.firstName} ${row.client.surname}`
                        : "Client"}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {row.project.researchTitle}
                    </p>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold">
                      {PAYMENT_OPTION_LABELS[q.paymentOption]}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Max Plan: {q.maxInstalmentMonths} months • Speed:{" "}
                      <span className="uppercase font-semibold">
                        {q.deliverySpeed}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatZarFromCents(q.totalFeeCents)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Paid: {formatZarFromCents(q.paidToDateCents)} | Bal:{" "}
                      {formatZarFromCents(q.balanceCents)}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-mono text-[11px]">
                      Valid until: {q.validUntil || "—"}
                    </div>
                    {isPastValidUntil ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 mt-1">
                        <AlertCircle className="h-3 w-3" /> Past Validity Date
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="h-3 w-3" /> Sent{" "}
                        {q.sentAt
                          ? new Date(q.sentAt).toLocaleDateString("en-ZA")
                          : "—"}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        q.outcome === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : q.outcome === "declined" || q.outcome === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {QUOTE_OUTCOME_LABELS[q.outcome]}
                    </span>
                    {q.whyLost && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        Why lost: {q.whyLost.replace("_", " ")}
                        {q.whyLostNotes ? ` (${q.whyLostNotes})` : ""}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyQuoteUrl(q.token, q.id)}
                        title="Copy Client Quote Link"
                        className="p-1.5 border border-slate-200 dark:border-zinc-700 text-slate-600 hover:text-tweaks-blue cursor-pointer"
                      >
                        {copiedId === q.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Link
                        href={`/quote/${q.token}`}
                        target="_blank"
                        title="Open Quote Page"
                        className="p-1.5 border border-slate-200 dark:border-zinc-700 text-slate-600 hover:text-tweaks-blue"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Outcome / Why Lost
                      </button>
                      <Link
                        href={`/projects/${row.project.id}`}
                        className="px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold hover:bg-tweaks-blue"
                      >
                        Project
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {quoteRows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-500 text-xs"
                >
                  No quotes match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Outcome & "Why Lost" Capture Modal */}
      {editingQuoteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuoteOutcome}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-xl"
          >
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Update Quote Status &amp; Why Lost
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Quote Outcome
                </label>
                <select
                  value={modalOutcome}
                  onChange={(e) =>
                    setModalOutcome(e.target.value as QuoteOutcome)
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold"
                >
                  {Object.entries(QUOTE_OUTCOME_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Valid Until Date
                </label>
                <input
                  type="date"
                  value={modalValidUntil}
                  onChange={(e) => setModalValidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>

              {(modalOutcome === "declined" || modalOutcome === "expired") && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Why Lost Reason *
                    </label>
                    <select
                      required
                      value={modalWhyLost}
                      onChange={(e) =>
                        setModalWhyLost(e.target.value as WhyLost | "")
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
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
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Why Lost Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={modalWhyLostNotes}
                      onChange={(e) => setModalWhyLostNotes(e.target.value)}
                      placeholder="Context on why quote was declined..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingQuoteId(null)}
                className="px-4 py-2 text-xs font-bold border border-slate-300 dark:border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold bg-tweaks-blue text-white cursor-pointer"
              >
                Save Outcome
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

