import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { getServerSession } from "@/lib/auth-server";
import {
  PROJECT_SORT_COOKIE,
  PROJECT_VIEW_COOKIE,
  isProjectSortOrder,
  isProjectViewMode,
  type ProjectSortOrder,
  type ProjectViewMode,
} from "@/lib/crm/projects-view-atoms";
import { ProjectsViewClient } from "./projects-view-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects & Pipeline",
};

type ProjectsPageProps = {
  searchParams: Promise<{ view?: string; stage?: string }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const [data, session, cookieStore, params] = await Promise.all([
    getAdminCrmDashboardData(),
    getServerSession(),
    cookies(),
    searchParams,
  ]);

  // An explicit ?view= link wins; otherwise restore the last chosen view.
  const cookieView = cookieStore.get(PROJECT_VIEW_COOKIE)?.value;
  const initialView: ProjectViewMode = isProjectViewMode(params.view)
    ? params.view
    : isProjectViewMode(cookieView)
      ? cookieView
      : "table";

  const cookieSort = cookieStore.get(PROJECT_SORT_COOKIE)?.value;
  const initialSortOrder: ProjectSortOrder = isProjectSortOrder(cookieSort)
    ? cookieSort
    : "return_date_asc";

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
        initialView={initialView}
        initialSortOrder={initialSortOrder}
        initialStage={params.stage || "all"}
      />
    </Suspense>
  );
}

