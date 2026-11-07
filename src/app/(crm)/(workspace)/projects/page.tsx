import React, { Suspense } from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { ProjectsViewClient } from "./projects-view-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects & Pipeline",
};

export default async function ProjectsPage() {
  const data = await getAdminCrmDashboardData();

  const distinctInstitutions = Array.from(
    new Set(data.rows.map((r) => r.institutionName).filter(Boolean))
  ).sort();

  return (
    <Suspense fallback={<div className="p-8 text-xs">Loading projects...</div>}>
      <ProjectsViewClient
        rows={data.rows}
        editors={data.editors}
        institutions={distinctInstitutions}
      />
    </Suspense>
  );
}

