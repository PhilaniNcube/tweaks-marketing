import React from "react";
import Link from "next/link";
import {
  Activity,
  FileText,
  Banknote,
  AlertTriangle,
  Building2,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import {
  formatZarFromCents,
  KANBAN_STAGES,
  getReturnScheduleStatus,
  STAGE_LABELS,
} from "@/components/crm/crm-helpers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operations Dashboard",
};

export default async function DashboardPage() {
  const data = await getAdminCrmDashboardData();
  const { kpis, rows, editors, pendingInstitutions, pendingDegreeLevels } = data;
  const activeRows = rows.filter((r) => !r.project.archivedAt);

  const activeEditorsCount = editors.filter((e) => e.isActive).length;
  const maxTrendCents = Math.max(
    100000,
    ...kpis.monthlyTrends.map((m) => Math.max(m.quotedCents, m.paidCents))
  );

  const urgentProjects = activeRows
    .map((r) => ({
      ...r,
      schedule: getReturnScheduleStatus(
        r.project.requestedReturnDate,
        r.project.stage
      ),
    }))
    .filter(
      (r) =>
        r.schedule.status === "late" ||
        r.schedule.status === "due_soon" ||
        (r.project.isDuplicateFlag && !r.project.duplicateResolved)
    )
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
            Tweaks Operations Command
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Main Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Real-time capacity, pages in hand, live revenue, PO exposure, pipeline stages, and 12-month performance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="px-3.5 py-2 text-xs font-bold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
          >
            View Pipeline
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/projects/new"
            className="px-4 py-2 text-xs font-bold bg-tweaks-blue hover:bg-tweaks-red text-white flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Intake
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 Operational Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Live Capacity
            </span>
            <Activity className="h-4 w-4 text-tweaks-blue" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.liveCapacityCount}{" "}
            <span className="text-xs font-semibold text-slate-400">
              active briefs
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            {activeEditorsCount} active editor{activeEditorsCount === 1 ? "" : "s"} on roster
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Pages in Hand
            </span>
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.pagesInHand.toLocaleString("en-ZA")}
          </p>
          <p className="text-[11px] text-slate-500">
            Across accepted &amp; editing stages
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Fees on Live Work
            </span>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {formatZarFromCents(kpis.feesOnLiveWorkCents)}
          </p>
          <p className="text-[11px] text-slate-500">
            Total collected: {formatZarFromCents(kpis.totalPaidCents)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Unpaid Finished Work
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {formatZarFromCents(kpis.unpaidFinishedWorkCents)}
          </p>
          <p className="text-[11px] text-slate-500">
            Work ready / delivered with balance
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              PO Releases Exposure
            </span>
            <Building2 className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">
            {formatZarFromCents(kpis.releasedOnPoExposureCents)}
          </p>
          <p className="text-[11px] text-slate-500">
            {kpis.poReleasesCount} Option 3 PO{kpis.poReleasesCount === 1 ? "" : "s"} awaiting payment
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Quote Conversion
            </span>
            <TrendingUp className="h-4 w-4 text-tweaks-blue" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.conversionRatePercent}%
          </p>
          <p className="text-[11px] text-slate-500">
            {kpis.totalProjects} total briefs logged
          </p>
        </div>
      </div>

      {/* Pipeline Stages Breakdown */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Live Pipeline Stage Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Click any stage to filter projects in the pipeline view.
            </p>
          </div>
          <Link
            href="/projects?view=kanban"
            className="text-xs font-bold text-tweaks-blue hover:underline flex items-center gap-1"
          >
            Open Kanban Board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {KANBAN_STAGES.map((st) => {
            const count = kpis.stageCounts[st.stage] || 0;
            return (
              <Link
                key={st.stage}
                href={`/projects?stage=${st.stage}`}
                className="p-3.5 border border-slate-200 dark:border-zinc-800 hover:border-tweaks-blue bg-slate-50/60 dark:bg-zinc-950/50 transition-colors space-y-1"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                  {st.title}
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {count}
                </p>
                <span className="text-[10px] text-slate-400 block truncate">
                  {st.subtitle}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two-Column Row: 12-Month Trend Chart & Urgent Attention Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Month Revenue & Volume Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                12-Month Revenue &amp; Volume Trends
              </h2>
              <p className="text-xs text-slate-500">
                Monthly quoted fees vs collected payments over the past 12 months.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-tweaks-blue inline-block" />
                Quoted ({formatZarFromCents(kpis.totalQuotedCents)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-emerald-500 inline-block" />
                Paid ({formatZarFromCents(kpis.totalPaidCents)})
              </span>
            </div>
          </div>

          <div className="h-52 flex items-end gap-2 pt-6 border-b border-slate-200 dark:border-zinc-800 pb-2">
            {kpis.monthlyTrends.map((m) => {
              const quotedHeight = Math.max(
                4,
                Math.round((m.quotedCents / maxTrendCents) * 150)
              );
              const paidHeight = Math.max(
                4,
                Math.round((m.paidCents / maxTrendCents) * 150)
              );
              return (
                <div
                  key={m.monthKey}
                  className="flex-1 flex flex-col items-center gap-1.5 group"
                >
                  <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.projectsCount}p
                  </span>
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    <div
                      style={{ height: `${quotedHeight}px` }}
                      title={`${m.label} Quoted: ${formatZarFromCents(m.quotedCents)}`}
                      className="w-2.5 sm:w-3 bg-tweaks-blue/80 hover:bg-tweaks-blue transition-all"
                    />
                    <div
                      style={{ height: `${paidHeight}px` }}
                      title={`${m.label} Paid: ${formatZarFromCents(m.paidCents)}`}
                      className="w-2.5 sm:w-3 bg-emerald-500/85 hover:bg-emerald-600 transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Alerts & Attention Required */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Attention Queue
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {urgentProjects.length} item{urgentProjects.length === 1 ? "" : "s"}
            </span>
          </div>

          {(pendingInstitutions.length > 0 || pendingDegreeLevels.length > 0) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs flex items-center justify-between">
              <span>
                <strong>
                  {pendingInstitutions.length + pendingDegreeLevels.length}
                </strong>{" "}
                custom lookup item(s) awaiting review
              </span>
              <Link
                href="/settings"
                className="font-bold text-amber-800 dark:text-amber-300 underline"
              >
                Review
              </Link>
            </div>
          )}

          {urgentProjects.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto" />
              <p className="font-semibold">All active projects are on schedule.</p>
              <p className="text-[11px] text-slate-400">
                No overdue return dates or unresolved duplicate flags.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {urgentProjects.map((row) => (
                <div
                  key={row.project.id}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${row.project.id}`}
                      className="text-xs font-bold text-slate-900 dark:text-white hover:text-tweaks-blue truncate block"
                    >
                      {row.client
                        ? `${row.client.firstName} ${row.client.surname}`
                        : "Client"}{" "}
                      — {row.project.documentType}
                    </Link>
                    <p className="text-[11px] text-slate-500 truncate">
                      {row.project.researchTitle}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Stage: {STAGE_LABELS[row.project.stage]}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {row.schedule.status === "late" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700">
                        {row.schedule.label}
                      </span>
                    )}
                    {row.schedule.status === "due_soon" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800">
                        {row.schedule.label}
                      </span>
                    )}
                    {row.project.isDuplicateFlag &&
                      !row.project.duplicateResolved && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800">
                          24h Duplicate
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects Snapshot */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Latest Project Briefs
          </h2>
          <Link
            href="/projects"
            className="text-xs font-bold text-tweaks-blue hover:underline flex items-center gap-1"
          >
            View All Projects ({activeRows.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pr-4">Client &amp; Research Title</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Return Date</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Fee &amp; Balance</th>
                <th className="py-2.5 pl-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {activeRows.slice(0, 8).map((r) => {
                const sched = getReturnScheduleStatus(
                  r.project.requestedReturnDate,
                  r.project.stage
                );
                return (
                  <tr
                    key={r.project.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {r.client
                          ? `${r.client.firstName} ${r.client.surname}`
                          : "Unknown"}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                        {r.project.researchTitle}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                      {r.institutionName}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px]">
                        {r.project.requestedReturnDate}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold px-1.5 py-0.5 mt-0.5 ${
                          sched.status === "late"
                            ? "bg-red-100 text-red-700"
                            : sched.status === "due_soon"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {sched.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-tweaks-blue/10 text-tweaks-blue">
                        {STAGE_LABELS[r.project.stage]}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold">
                        {formatZarFromCents(r.quote?.totalFeeCents)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Bal: {formatZarFromCents(r.quote?.balanceCents)}
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <Link
                        href={`/projects/${r.project.id}`}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold hover:bg-tweaks-blue transition-colors inline-block"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {activeRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-500 text-xs"
                  >
                    No projects logged yet. Click &ldquo;New Intake&rdquo; to create your first project brief.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

