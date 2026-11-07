import React from "react";
import { notFound } from "next/navigation";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { ProjectDetailClient } from "./project-detail-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project Detail & Workspace",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminCrmDashboardData();
  const row = data.rows.find((r) => r.project.id === id);

  if (!row) {
    notFound();
  }

  return <ProjectDetailClient row={row} editors={data.editors} />;
}

