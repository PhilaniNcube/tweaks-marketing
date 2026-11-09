import React from "react";
import Link from "next/link";
import { Archive, Award, ExternalLink } from "lucide-react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { getServerSession } from "@/lib/auth-server";
import { ProjectAdminActions } from "@/components/crm/project-admin-actions";
import {
  formatZarFromCents,
  STAGE_LABELS,
} from "@/components/crm/crm-helpers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project Archive",
};

export default async function ArchivePage() {
  const [data, session] = await Promise.all([
    getAdminCrmDashboardData(),
    getServerSession(),
  ]);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const archivedRows = data.rows.filter(
    (r) =>
      Boolean(r.project.archivedAt) ||
      r.project.stage === "complete" ||
      r.project.stage === "closed" ||
      r.project.stage === "lost"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
          Historical Repository
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5 flex items-center gap-2.5">
          <Archive className="h-6 w-6 text-tweaks-blue" />
          Archived &amp; Closed Projects ({archivedRows.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical repository of archived, completed, closed, and lost
          projects. Admins can restore archived records or permanently delete
          them directly from this list.
        </p>
      </div>

      {/* Archive Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Client &amp; Research Title</th>
              <th className="py-3 px-3">Institution &amp; Degree</th>
              <th className="py-3 px-3">Final Stage</th>
              <th className="py-3 px-3">Closure / Why Lost Reason</th>
              <th className="py-3 px-3">Final Fee &amp; Paid</th>
              <th className="py-3 px-3">Certificate</th>
              <th className="py-3 px-4 text-right">Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {archivedRows.map((r) => (
              <tr
                key={r.project.id}
                className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
              >
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {r.client
                      ? `${r.client.firstName} ${r.client.surname}`
                      : "Client"}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {r.project.researchTitle}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">
                    {r.quote?.quoteNumber}
                  </span>
                </td>

                <td className="py-3.5 px-3">
                  <div className="font-semibold">{r.institutionName}</div>
                  <div className="text-[11px] text-slate-500">
                    {r.project.degreeLevel} — {r.project.degreeProgramme}
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                      r.project.stage === "complete"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.project.stage === "lost"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {STAGE_LABELS[r.project.stage]}
                  </span>
                  {r.project.archivedAt && (
                    <div className="mt-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        Archived
                      </span>
                    </div>
                  )}
                  {r.project.completedAt && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(r.project.completedAt).toLocaleDateString(
                        "en-ZA"
                      )}
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-3">
                  {r.project.stage === "complete" ? (
                    <span className="text-emerald-700 font-semibold">
                      Successfully delivered &amp; completed
                    </span>
                  ) : r.quote?.whyLost ? (
                    <div>
                      <span className="font-bold text-red-600 uppercase text-[10px]">
                        {r.quote.whyLost.replace("_", " ")}
                      </span>
                      {r.quote.whyLostNotes && (
                        <p className="text-[11px] text-slate-500">
                          {r.quote.whyLostNotes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      {r.project.internalNotes || "Closed"}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-3 font-mono">
                  <div className="font-bold">
                    {formatZarFromCents(r.quote?.totalFeeCents)}
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    Paid: {formatZarFromCents(r.quote?.paidToDateCents)}
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  {r.certificate ? (
                    <Link
                      href={`/certificate/view/${r.certificate.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline"
                    >
                      <Award className="h-3.5 w-3.5" /> {r.certificate.id}{" "}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ProjectAdminActions
                      projectId={r.project.id}
                      archived={!!r.project.archivedAt}
                      isAdmin={isAdmin}
                      compact
                      redirectTo="/archive"
                    />
                    <Link
                      href={`/projects/${r.project.id}`}
                      className="px-3 py-1.5 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold hover:bg-slate-100"
                    >
                      View Record
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {archivedRows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-500 text-xs"
                >
                  No archived, completed, closed, or lost projects in the archive yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

