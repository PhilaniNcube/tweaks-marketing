import React, { Suspense } from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { getServerSession } from "@/lib/auth-server";
import { ProjectsViewClient } from "./projects-view-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects & Pipeline",
};

export default async function ProjectsPage() {
  const [data, session] = await Promise.all([
    getAdminCrmDashboardData(),
    getServerSession(),
  ]);

  const distinctInstitutions = Array.from(
    new Set(data.rows.map((r) => r.institutionName).filter(Boolean))
  ).sort();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  return (
    <Suspense fallback={<div className="p-8 text-xs">Loading projects...</div>}>
      <ProjectsViewClient
        rows={data.rows}
        editors={data.editors}
        institutions={distinctInstitutions}
        isAdmin={isAdmin}
      />
    </Suspense>
  );
}

