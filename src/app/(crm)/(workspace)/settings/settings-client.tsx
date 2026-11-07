"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Save,
  Sliders,
  UserPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  updateServiceRateCardItem,
  updateCrmSettingAction,
  upsertEditorAction,
  reviewQueueItemAction,
} from "@/app/actions/crm";
import type {
  Service,
  RateCardRule,
  Editor,
  Institution,
  DegreeLevel,
} from "@/db/schema";
import { toast } from "sonner";

interface SettingsClientProps {
  services: Service[];
  rules: RateCardRule[];
  settings: Record<string, string>;
  editors: Editor[];
  pendingInstitutions: Institution[];
  pendingDegreeLevels: DegreeLevel[];
}

const POLICY_KEYS: Array<{
  key: string;
  label: string;
  unit: string;
  description: string;
}> = [
  {
    key: "words_per_page",
    label: "Per-Page Formula (Words per Page)",
    unit: "words",
    description:
      "Used to auto-calculate billable pages from word count (default: 300).",
  },
  {
    key: "quote_validity_days",
    label: "Quote Validity Window",
    unit: "days",
    description:
      "Number of days a generated quote link remains valid before expiring (default: 14).",
  },
  {
    key: "deposit_percentage",
    label: "Option 2 Payment Plan Deposit",
    unit: "%",
    description:
      "Upfront deposit percentage required to start editing on an instalment plan (default: 50%).",
  },
  {
    key: "payment_plan_3_month_threshold_cents",
    label: "3-Month Plan Threshold (in ZAR cents)",
    unit: "cents",
    description:
      "300000 = R3,000. Below this threshold max 2 months; at/above max 3 months.",
  },
  {
    key: "review_window_hours",
    label: "Post-Delivery Review Window",
    unit: "hours",
    description:
      "Client review window started when the handover package is first opened (default: 72h).",
  },
  {
    key: "access_expiry_days",
    label: "Download Access Expiry Window",
    unit: "days",
    description:
      "Days after project completion before package download links expire (default: 30d).",
  },
];

export function SettingsClient({
  services,
  rules,
  settings,
  editors,
  pendingInstitutions,
  pendingDegreeLevels,
}: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local editable state for services
  const [svcDrafts, setSvcDrafts] = useState<
    Record<
      string,
      {
        standardRateRands: number;
        expressSurchargeRands: number;
        minDays: number;
        maxDays: number;
        qbItemId: string;
        isActive: boolean;
      }
    >
  >(() => {
    const init: Record<
      string,
      {
        standardRateRands: number;
        expressSurchargeRands: number;
        minDays: number;
        maxDays: number;
        qbItemId: string;
        isActive: boolean;
      }
    > = {};
    for (const s of services) {
      init[s.id] = {
        standardRateRands: s.standardRateCents / 100,
        expressSurchargeRands: s.expressSurchargeCents / 100,
        minDays: s.standardTurnaroundMinDays,
        maxDays: s.standardTurnaroundMaxDays,
        qbItemId: s.quickbooksItemId || "",
        isActive: s.isActive,
      };
    }
    return init;
  });

  // Local editable state for policy settings
  const [policyDrafts, setPolicyDrafts] =
    useState<Record<string, string>>(settings);

  // New editor state
  const [editorName, setEditorName] = useState("");
  const [editorEmail, setEditorEmail] = useState("");
  const [editorWhatsapp, setEditorWhatsapp] = useState("");
  const [editorRole, setEditorRole] = useState<"editor" | "admin">("editor");

  const handleSaveService = (serviceId: string) => {
    const d = svcDrafts[serviceId];
    if (!d) return;
    startTransition(async () => {
      const res = await updateServiceRateCardItem({
        serviceId,
        standardRateRands: Number(d.standardRateRands),
        expressSurchargeRands: Number(d.expressSurchargeRands),
        standardTurnaroundMinDays: Number(d.minDays),
        standardTurnaroundMaxDays: Number(d.maxDays),
        quickbooksItemId: d.qbItemId,
        isActive: d.isActive,
      });
      if (res.success) {
        toast.success("Service rate card updated");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update service");
      }
    });
  };

  const handleSavePolicy = (key: string, description: string) => {
    const val = policyDrafts[key] ?? "";
    startTransition(async () => {
      const res = await updateCrmSettingAction({
        key,
        value: val,
        description,
      });
      if (res.success) {
        toast.success(`Updated ${key}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save setting");
      }
    });
  };

  const handleAddEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorName.trim() || !editorEmail.trim()) return;
    startTransition(async () => {
      const res = await upsertEditorAction({
        name: editorName,
        email: editorEmail,
        whatsapp: editorWhatsapp,
        role: editorRole,
        isActive: true,
      });
      if (res.success) {
        toast.success("Editor added to roster");
        setEditorName("");
        setEditorEmail("");
        setEditorWhatsapp("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add editor");
      }
    });
  };

  const handleReviewItem = (
    kind: "institution" | "degree_level",
    id: string,
    decision: "approved" | "rejected"
  ) => {
    startTransition(async () => {
      const res = await reviewQueueItemAction({ kind, id, decision });
      if (res.success) {
        toast.success(`Item ${decision}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
          Source of Truth Configuration
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5 flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-tweaks-blue" />
          Rate Card, Business Rules &amp; Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure base rates, per-page formulas, flat fees, express surcharges, turnaround defaults, quote validity windows, deposit percentages, and editors.
        </p>
      </div>

      {/* SECTION 1: 6 LIVE SERVICES RATE CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            1. Service Catalog &amp; Rate Card
          </h2>
          <p className="text-xs text-slate-500">
            Update standard rates, express surcharges, turnaround windows, and QuickBooks Item IDs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3">Service Name &amp; Formula</th>
                <th className="py-3 px-3">Standard Rate (ZAR)</th>
                <th className="py-3 px-3">Express Surcharge (ZAR)</th>
                <th className="py-3 px-3">Std Turnaround (Days)</th>
                <th className="py-3 px-3">QuickBooks Item ID</th>
                <th className="py-3 px-3">Active</th>
                <th className="py-3 px-3 text-right">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {services.map((svc) => {
                const d = svcDrafts[svc.id];
                if (!d) return null;
                return (
                  <tr key={svc.id}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {svc.name}
                      </div>
                      <div className="text-[10px] font-mono text-tweaks-blue">
                        Basis: {svc.pricingBasis}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={d.standardRateRands}
                        onChange={(e) =>
                          setSvcDrafts((prev) => ({
                            ...prev,
                            [svc.id]: {
                              ...prev[svc.id],
                              standardRateRands: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-24 px-2 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={d.expressSurchargeRands}
                        onChange={(e) =>
                          setSvcDrafts((prev) => ({
                            ...prev,
                            [svc.id]: {
                              ...prev[svc.id],
                              expressSurchargeRands: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-24 px-2 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          value={d.minDays}
                          onChange={(e) =>
                            setSvcDrafts((prev) => ({
                              ...prev,
                              [svc.id]: {
                                ...prev[svc.id],
                                minDays: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-12 px-1.5 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-center"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          value={d.maxDays}
                          onChange={(e) =>
                            setSvcDrafts((prev) => ({
                              ...prev,
                              [svc.id]: {
                                ...prev[svc.id],
                                maxDays: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-12 px-1.5 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-center"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="QBO-ITEM-ID"
                        value={d.qbItemId}
                        onChange={(e) =>
                          setSvcDrafts((prev) => ({
                            ...prev,
                            [svc.id]: {
                              ...prev[svc.id],
                              qbItemId: e.target.value,
                            },
                          }))
                        }
                        className="w-28 px-2 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-[11px]"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={d.isActive}
                        onChange={(e) =>
                          setSvcDrafts((prev) => ({
                            ...prev,
                            [svc.id]: {
                              ...prev[svc.id],
                              isActive: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 accent-tweaks-blue"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSaveService(svc.id)}
                        className="px-3 py-1.5 bg-tweaks-blue hover:bg-tweaks-red text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="h-3 w-3" /> Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CONDITIONAL RATE CARD RULES & BUSINESS POLICIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Policy Parameters */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
            <Sliders className="h-4 w-4 text-tweaks-blue" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              2. Business Rules &amp; Policy Parameters
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
            {POLICY_KEYS.map((item) => (
              <div key={item.key} className="py-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={policyDrafts[item.key] ?? ""}
                      onChange={(e) =>
                        setPolicyDrafts((prev) => ({
                          ...prev,
                          [item.key]: e.target.value,
                        }))
                      }
                      className="w-24 px-2 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-right"
                    />
                    <span className="text-[10px] text-slate-400 w-10">
                      {item.unit}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleSavePolicy(item.key, item.description)
                      }
                      className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Rate Card Rules + Editors Roster */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Conditional Rate Card Rules ({rules.length})
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {rules.map((r) => (
                <div key={r.id} className="py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-tweaks-blue/10 text-tweaks-blue font-bold">
                      {r.conditionField} {r.operator} {r.conditionValue} →{" "}
                      {r.effectType}={r.effectValue}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Editors Roster Management */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-tweaks-blue" />
              Editors Roster ({editors.length})
            </h2>

            <form
              onSubmit={handleAddEditor}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input
                type="text"
                required
                placeholder="Editor Name"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={editorEmail}
                onChange={(e) => setEditorEmail(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
              <select
                value={editorRole}
                onChange={(e) =>
                  setEditorRole(e.target.value as "editor" | "admin")
                }
                className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={isPending}
                className="px-3 py-1.5 bg-tweaks-blue text-white font-bold cursor-pointer"
              >
                + Add Editor
              </button>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {editors.map((ed) => (
                <div
                  key={ed.id}
                  className="py-2 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold">{ed.name}</span>{" "}
                    <span className="text-slate-500">({ed.email})</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800">
                    {ed.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lookup Review Queue */}
          {(pendingInstitutions.length > 0 ||
            pendingDegreeLevels.length > 0) && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-600">
                Pending Lookup Review Queue
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {pendingInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <span>
                      Institution: <strong>{inst.name}</strong>
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewItem("institution", inst.id, "approved")
                        }
                        className="p-1 text-emerald-600 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewItem("institution", inst.id, "rejected")
                        }
                        className="p-1 text-red-600 cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingDegreeLevels.map((dl) => (
                  <div
                    key={dl.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <span>
                      Degree Level: <strong>{dl.designator}</strong>
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewItem("degree_level", dl.id, "approved")
                        }
                        className="p-1 text-emerald-600 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewItem("degree_level", dl.id, "rejected")
                        }
                        className="p-1 text-red-600 cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

