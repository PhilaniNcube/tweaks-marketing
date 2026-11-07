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
  ShieldCheck,
  Shield,
  Key,
  Copy,
  Trash2,
  Mail,
  Link2,
  UserCheck,
  Send,
  Check,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import {
  updateServiceRateCardItem,
  updateCrmSettingAction,
  upsertEditorAction,
  reviewQueueItemAction,
} from "@/app/actions/crm";
import {
  createAdminUserAction,
  inviteAdminUserAction,
  revokeAdminInviteAction,
  updateUserRoleAction,
  deleteUserAction,
  type UserItem,
  type PendingInviteItem,
} from "@/app/actions/admin-users";
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
  teamUsers?: UserItem[];
  pendingInvites?: PendingInviteItem[];
  currentUserId?: string;
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
  teamUsers = [],
  pendingInvites = [],
  currentUserId,
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

  // New editor state (for document assignment roster)
  const [editorName, setEditorName] = useState("");
  const [editorEmail, setEditorEmail] = useState("");
  const [editorWhatsapp, setEditorWhatsapp] = useState("");
  const [editorRole, setEditorRole] = useState<"editor" | "admin">("editor");

  // Team Admin & Invite state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor">("admin");
  const [latestInvite, setLatestInvite] = useState<{
    link: string;
    email: string;
    emailSent: boolean;
  } | null>(null);

  const [showDirectForm, setShowDirectForm] = useState(false);
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directPassword, setDirectPassword] = useState("");
  const [directRole, setDirectRole] = useState<"admin" | "editor">("admin");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string, label: string = "Invite link") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setDirectPassword(pwd);
  };

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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      const res = await inviteAdminUserAction({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
      });
      if (res.success && res.inviteLink) {
        setLatestInvite({
          link: res.inviteLink,
          email: inviteEmail.trim(),
          emailSent: !!res.emailSent,
        });
        toast.success(
          res.emailSent
            ? `Invitation dispatched to ${inviteEmail.trim()}`
            : `Invite link created for ${inviteEmail.trim()}`
        );
        setInviteEmail("");
        setInviteName("");
        setShowInviteForm(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create invitation");
      }
    });
  };

  const handleCreateDirectUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim() || !directEmail.trim() || !directPassword) return;
    startTransition(async () => {
      const res = await createAdminUserAction({
        name: directName.trim(),
        email: directEmail.trim(),
        password: directPassword,
        role: directRole,
      });
      if (res.success) {
        toast.success(`Account for ${directName.trim()} created!`);
        setDirectName("");
        setDirectEmail("");
        setDirectPassword("");
        setShowDirectForm(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create user account");
      }
    });
  };

  const handleRevokeInvite = (inviteId: string) => {
    startTransition(async () => {
      const res = await revokeAdminInviteAction(inviteId);
      if (res.success) {
        toast.success("Invitation revoked");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to revoke invitation");
      }
    });
  };

  const handleUpdateRole = (userId: string, newRole: "admin" | "editor") => {
    startTransition(async () => {
      const res = await updateUserRoleAction({ userId, role: newRole });
      if (res.success) {
        toast.success("User role updated");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update role");
      }
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove user "${userName}"? They will no longer be able to log in.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (res.success) {
        toast.success(`User ${userName} removed`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove user");
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
          Configure base rates, turnaround defaults, quote validity windows, deposit percentages, editors, and administrator team access.
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
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Pricing Basis</th>
                <th className="py-2.5 px-3">Standard Rate (ZAR)</th>
                <th className="py-2.5 px-3">Express Surcharge (ZAR)</th>
                <th className="py-2.5 px-3">Standard Turnaround</th>
                <th className="py-2.5 px-3">QB Item ID</th>
                <th className="py-2.5 px-3">Active</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {services.map((svc) => {
                const draft = svcDrafts[svc.id] || {
                  standardRateRands: svc.standardRateCents / 100,
                  expressSurchargeRands: svc.expressSurchargeCents / 100,
                  minDays: svc.standardTurnaroundMinDays,
                  maxDays: svc.standardTurnaroundMaxDays,
                  qbItemId: svc.quickbooksItemId || "",
                  isActive: svc.isActive,
                };

                return (
                  <tr
                    key={svc.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {svc.name}
                      <p className="text-[10px] text-slate-400 font-normal">
                        slug: {svc.slug}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 uppercase font-bold">
                        {svc.pricingBasis}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">R</span>
                        <input
                          type="number"
                          step="0.01"
                          value={draft.standardRateRands}
                          onChange={(e) =>
                            setSvcDrafts((prev) => ({
                              ...prev,
                              [svc.id]: {
                                ...draft,
                                standardRateRands: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-right"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {svc.hasExpressOption ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">R</span>
                          <input
                            type="number"
                            step="0.01"
                            value={draft.expressSurchargeRands}
                            onChange={(e) =>
                              setSvcDrafts((prev) => ({
                                ...prev,
                                [svc.id]: {
                                  ...draft,
                                  expressSurchargeRands:
                                    parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-right"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={draft.minDays}
                          onChange={(e) =>
                            setSvcDrafts((prev) => ({
                              ...prev,
                              [svc.id]: {
                                ...draft,
                                minDays: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-12 px-1 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-center"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="number"
                          value={draft.maxDays}
                          onChange={(e) =>
                            setSvcDrafts((prev) => ({
                              ...prev,
                              [svc.id]: {
                                ...draft,
                                maxDays: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-12 px-1 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400">days</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={draft.qbItemId}
                        placeholder="e.g. 12"
                        onChange={(e) =>
                          setSvcDrafts((prev) => ({
                            ...prev,
                            [svc.id]: {
                              ...draft,
                              qbItemId: e.target.value,
                            },
                          }))
                        }
                        className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(e) =>
                          setSvcDrafts((prev) => ({
                            ...prev,
                            [svc.id]: {
                              ...draft,
                              isActive: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 text-tweaks-blue rounded border-slate-300"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSaveService(svc.id)}
                        className="px-3 py-1.5 bg-tweaks-blue hover:bg-tweaks-red text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
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
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold cursor-pointer transition-colors"
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

          {/* Document Assignment Editors Roster */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-tweaks-blue" />
              Document Assignment Roster ({editors.length})
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
                className="px-3 py-1.5 bg-tweaks-blue hover:bg-tweaks-red text-white font-bold cursor-pointer transition-colors"
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

      {/* SECTION 3: TEAM ACCESS & ADMINISTRATOR ACCOUNTS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-tweaks-blue" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                3. Team Access &amp; Administrator Accounts
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Invite additional administrators or editors via secure tokenized link, or create credentials directly on the spot.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowInviteForm((prev) => !prev);
                setShowDirectForm(false);
              }}
              className="px-3 py-2 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {showInviteForm ? "Close Invite Form" : "+ Invite via Link / Email"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDirectForm((prev) => !prev);
                setShowInviteForm(false);
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Key className="h-3.5 w-3.5" />
              {showDirectForm ? "Close Form" : "+ Create Account Directly"}
            </button>
          </div>
        </div>

        {/* Latest Generated Invite Banner */}
        {latestInvite && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Invitation Active for <strong>{latestInvite.email}</strong>
                </span>
                {latestInvite.emailSent && (
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded font-mono">
                    Email Dispatched
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLatestInvite(null)}
                className="text-xs text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                &times; Dismiss
              </button>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Share this link with your new team member. They can choose their password and sign in immediately:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={latestInvite.link}
                className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 font-mono text-slate-700 dark:text-slate-200 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(latestInvite.link, "latest-invite", "Invite Link")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedId === "latest-invite" ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Form: Invite via Link / Email */}
        {showInviteForm && (
          <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-tweaks-blue" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Send / Generate Team Invitation
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Generates a secure 7-day tokenized link. If Resend email delivery is configured, an email with an acceptance button will be dispatched automatically.
            </p>

            <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@tweaks.co.za"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Chengetai / Jane"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Designated Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "editor")}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="editor">Editor (Briefs &amp; Workspaces)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2 bg-tweaks-blue hover:bg-tweaks-red text-white font-bold cursor-pointer transition-colors"
                >
                  Generate Invite
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Form: Create Account Directly */}
        {showDirectForm && (
          <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-tweaks-blue" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Create User Account Directly
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Immediately creates the credentials in the database. Share the chosen password with the user so they can log in via <code>/admin/login</code>.
            </p>

            <form onSubmit={handleCreateDirectUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@tweaks.co.za"
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Role *
                  </label>
                  <select
                    value={directRole}
                    onChange={(e) => setDirectRole(e.target.value as "admin" | "editor")}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="admin">Administrator (Full Access)</option>
                    <option value="editor">Editor (Briefs &amp; Workspaces)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                      Initial Password (min 8 chars) *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] text-tweaks-blue hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" /> Generate Strong Password
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
                  >
                    Create User Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Current Active Team Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="h-4 w-4 text-tweaks-blue" />
              Active Team Members ({teamUsers.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Admins can manage rate cards, settings, and team access.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Current Role</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {teamUsers.map((u) => {
                  const isCurrent = currentUserId === u.id;
                  const joinedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-tweaks-blue text-white rounded">
                            YOU
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 font-mono">
                        {u.email}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                            u.role === "admin"
                              ? "bg-tweaks-blue/10 text-tweaks-blue border border-tweaks-blue/20"
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500">{joinedDate}</td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          {!isCurrent ? (
                            <>
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleUpdateRole(
                                    u.id,
                                    e.target.value as "admin" | "editor"
                                  )
                                }
                                disabled={isPending}
                                className="px-2 py-1 text-[11px] border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 cursor-pointer"
                              >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                              </select>

                              <button
                                type="button"
                                title="Remove User"
                                disabled={isPending}
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Logged In
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Invitations List */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Invitations ({pendingInvites.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-3">Invited Email</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Expires</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {pendingInvites.map((inv) => {
                    const expiryDisplay = inv.expiresAt
                      ? new Date(inv.expiresAt).toLocaleDateString("en-ZA", {
                          month: "short",
                          day: "numeric",
                        })
                      : "7 days";

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white">
                          {inv.email}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {inv.name || "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          Expires {expiryDisplay}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  inv.inviteLink,
                                  inv.id,
                                  "Invite Link"
                                )
                              }
                              className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === inv.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />{" "}
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copy Link
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
