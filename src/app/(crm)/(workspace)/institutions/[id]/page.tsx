import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Users,
  Banknote,
  FileText,
} from "lucide-react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import {
  formatZarFromCents,
  STAGE_LABELS,
} from "@/components/crm/crm-helpers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Institution Profile",
};

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminCrmDashboardData();
  const institution = data.institutions.find((i) => i.id === id);

  if (!institution) {
    notFound();
  }

  const instProjects = data.rows.filter(
    (r) =>
      r.project.institutionId === institution.id ||
      r.institutionName.toLowerCase() === institution.name.toLowerCase()
  );

  const affiliatedProgrammes = data.degreeProgrammes.filter(
    (p) => p.institutionId === institution.id
  );

  // Also collect programmes from projects if not explicitly linked by institutionId
  const projectProgrammesMap = new Map<string, number>();
  for (const prog of affiliatedProgrammes) {
    projectProgrammesMap.set(prog.name, prog.usageCount);
  }
  for (const r of instProjects) {
    const pName = r.project.degreeProgramme;
    if (pName && !projectProgrammesMap.has(pName)) {
      projectProgrammesMap.set(pName, 1);
    }
  }

  const totalQuotedCents = instProjects.reduce(
    (sum, r) => sum + (r.quote?.totalFeeCents || 0),
    0
  );
  const totalPaidCents = instProjects.reduce(
    (sum, r) => sum + (r.quote?.paidToDateCents || 0),
    0
  );

  // Unique billing / PO contacts at this institution
  const billingContacts = instProjects
    .filter((r) => r.project.billingContactName || r.project.billingContactEmail)
    .map((r) => ({
      name: r.project.billingContactName || "—",
      email: r.project.billingContactEmail || "—",
      department: r.project.department || "—",
      poNumber: r.quote?.poNumber || null,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-5">
        <Link
          href="/institutions"
          className="text-xs font-bold text-slate-500 hover:text-tweaks-blue inline-flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Institutions Directory
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Building2 className="h-6 w-6 text-tweaks-blue" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {institution.name}
          </h1>
          {institution.shortName && (
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-200 dark:bg-zinc-800">
              {institution.shortName}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Default PO Payment Terms: {institution.defaultPaymentTermsDays} days •
          Email Domains: {institution.emailDomains || "Standard academic"}
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-tweaks-blue" /> Total Projects
          </span>
          <p className="text-2xl font-black mt-1">{instProjects.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" /> Affiliated
            Programmes
          </span>
          <p className="text-2xl font-black mt-1">
            {projectProgrammesMap.size}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-emerald-600" /> Total Quoted
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatZarFromCents(totalQuotedCents)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-purple-600" /> Collected Revenue
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatZarFromCents(totalPaidCents)}
          </p>
        </div>
      </div>

      {/* Two-Column: Affiliated Programmes & Billing/PO Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
            Affiliated Degree Programmes ({projectProgrammesMap.size})
          </h2>
          {projectProgrammesMap.size === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No programmes logged for this institution yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from(projectProgrammesMap.entries()).map(
                ([name, count]) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                  >
                    {name}{" "}
                    <span className="font-mono text-[10px] text-tweaks-blue ml-1">
                      ({count})
                    </span>
                  </span>
                )
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
            Departmental Billing &amp; PO Contacts ({billingContacts.length})
          </h2>
          {billingContacts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No Option 3 institutional billing contacts recorded for this institution yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {billingContacts.map((bc, idx) => (
                <div
                  key={idx}
                  className="py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">{bc.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {bc.department} • {bc.email}
                    </p>
                  </div>
                  {bc.poNumber && (
                    <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5">
                      PO: {bc.poNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historical & Active Projects Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Historical &amp; Active Projects ({instProjects.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pr-4">Researcher &amp; Title</th>
                <th className="py-2.5 px-3">Degree &amp; Programme</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Quote Fee</th>
                <th className="py-2.5 pl-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {instProjects.map((r) => (
                <tr key={r.project.id}>
                  <td className="py-3 pr-4">
                    <div className="font-bold">
                      {r.client
                        ? `${r.client.firstName} ${r.client.surname}`
                        : "Client"}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {r.project.researchTitle}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {r.project.degreeLevel} — {r.project.degreeProgramme}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-tweaks-blue/10 text-tweaks-blue">
                      {STAGE_LABELS[r.project.stage]}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    {formatZarFromCents(r.quote?.totalFeeCents)}
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <Link
                      href={`/projects/${r.project.id}`}
                      className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {instProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500 text-xs"
                  >
                    No projects recorded for {institution.name} yet.
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

