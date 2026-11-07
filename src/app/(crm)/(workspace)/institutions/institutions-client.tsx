"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatZarFromCents } from "@/components/crm/crm-helpers";
import {
  upsertInstitutionAction,
  reviewQueueItemAction,
} from "@/app/actions/crm";
import type { Institution } from "@/db/schema";
import type { getAdminCrmDashboardData } from "@/app/actions/crm";
import { toast } from "sonner";

type DashboardData = Awaited<ReturnType<typeof getAdminCrmDashboardData>>;
type EnrichedProjectRow = DashboardData["rows"][number];

interface InstitutionsClientProps {
  institutions: Institution[];
  rows: EnrichedProjectRow[];
}

const TYPE_LABELS: Record<Institution["institutionType"], string> = {
  public_university: "Public University",
  university_of_technology: "University of Technology",
  comprehensive_university: "Comprehensive University",
  private_institution: "Private / TVET Institution",
  other: "Other Institution",
};

export function InstitutionsClient({
  institutions,
  rows,
}: InstitutionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newShortName, setNewShortName] = useState("");
  const [newType, setNewType] =
    useState<Institution["institutionType"]>("public_university");
  const [newDomains, setNewDomains] = useState("");
  const [newTerms, setNewTerms] = useState(30);

  // Compute cumulative metrics per institution
  const enrichedInstitutions = useMemo(() => {
    return institutions
      .map((inst) => {
        const instProjects = rows.filter(
          (r) =>
            r.project.institutionId === inst.id ||
            r.institutionName.toLowerCase() === inst.name.toLowerCase()
        );
        const activeStudents = new Set(
          instProjects
            .filter(
              (r) =>
                r.project.stage !== "complete" &&
                r.project.stage !== "closed" &&
                r.project.stage !== "lost"
            )
            .map((r) => r.project.clientId)
        ).size;
        const totalRevenueCents = instProjects.reduce(
          (acc, r) => acc + (r.quote?.totalFeeCents || 0),
          0
        );
        const collectedRevenueCents = instProjects.reduce(
          (acc, r) => acc + (r.quote?.paidToDateCents || 0),
          0
        );

        return {
          institution: inst,
          projectCount: instProjects.length,
          activeStudents,
          totalRevenueCents,
          collectedRevenueCents,
        };
      })
      .filter((item) => {
        if (
          typeFilter !== "all" &&
          item.institution.institutionType !== typeFilter
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.institution.name.toLowerCase().includes(q);
          const matchShort = (item.institution.shortName || "")
            .toLowerCase()
            .includes(q);
          if (!matchName && !matchShort) return false;
        }
        return true;
      });
  }, [institutions, rows, typeFilter, searchQuery]);

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await upsertInstitutionAction({
        name: newName,
        shortName: newShortName,
        institutionType: newType,
        emailDomains: newDomains,
        defaultPaymentTermsDays: newTerms,
        status: "approved",
      });
      if (res.success) {
        toast.success("Institution added to directory");
        setShowAddModal(false);
        setNewName("");
        setNewShortName("");
        setNewDomains("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add institution");
      }
    });
  };

  const handleReviewDecision = (
    id: string,
    decision: "approved" | "rejected"
  ) => {
    startTransition(async () => {
      const res = await reviewQueueItemAction({
        kind: "institution",
        id,
        decision,
      });
      if (res.success) {
        toast.success(`Institution ${decision}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
            Higher Education Directory
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Institutions Directory ({enrichedInstitutions.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Public universities, universities of technology, comprehensive universities, and private institutions with cumulative project counts and revenue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-bold bg-tweaks-blue hover:bg-tweaks-red text-white flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Institution
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All Institutions"],
              ["public_university", "Public Universities"],
              ["university_of_technology", "Universities of Technology"],
              ["comprehensive_university", "Comprehensive"],
              ["private_institution", "Private / TVET"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setTypeFilter(val)}
              className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
                typeFilter === val
                  ? "bg-tweaks-blue text-white border-tweaks-blue"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institution or acronym..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Institution Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Total Projects</th>
              <th className="py-3 px-3">Active Students</th>
              <th className="py-3 px-3">Cumulative Revenue</th>
              <th className="py-3 px-3">PO Terms</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {enrichedInstitutions.map(
              ({
                institution,
                projectCount,
                activeStudents,
                totalRevenueCents,
                collectedRevenueCents,
              }) => (
                <tr
                  key={institution.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-tweaks-blue shrink-0" />
                      <div>
                        <Link
                          href={`/institutions/${institution.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-tweaks-blue"
                        >
                          {institution.name}
                        </Link>
                        {institution.shortName && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600">
                            {institution.shortName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 dark:text-zinc-400">
                    {TYPE_LABELS[institution.institutionType]}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold">
                    {projectCount}
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    {activeStudents} active
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatZarFromCents(totalRevenueCents)}
                    </div>
                    <div className="text-[10px] text-emerald-600">
                      Paid: {formatZarFromCents(collectedRevenueCents)}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {institution.defaultPaymentTermsDays} days
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {institution.status === "pending_review" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleReviewDecision(institution.id, "approved")
                            }
                            title="Approve Institution"
                            className="p-1 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleReviewDecision(institution.id, "rejected")
                            }
                            title="Reject"
                            className="p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/institutions/${institution.id}`}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold hover:bg-tweaks-blue inline-flex items-center gap-1"
                      >
                        Profile <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Add Institution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddInstitution}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-xl"
          >
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Add Institution to Directory
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Short Name / Acronym
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UCT"
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Default PO Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={newTerms}
                    onChange={(e) => setNewTerms(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={newType}
                  onChange={(e) =>
                    setNewType(
                      e.target.value as Institution["institutionType"]
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {Object.entries(TYPE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Institutional Email Domains (JSON or comma-separated)
                </label>
                <input
                  type="text"
                  placeholder='["uct.ac.za"]'
                  value={newDomains}
                  onChange={(e) => setNewDomains(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold bg-tweaks-blue text-white cursor-pointer"
              >
                Save Institution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

