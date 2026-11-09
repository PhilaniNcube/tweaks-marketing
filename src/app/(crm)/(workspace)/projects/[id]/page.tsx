import React from "react";
import { notFound } from "next/navigation";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { getServerSession } from "@/lib/auth-server";
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
  const [data, session] = await Promise.all([
    getAdminCrmDashboardData(),
    getServerSession(),
  ]);
  const row = data.rows.find((r) => r.project.id === id);

  if (!row) {
    notFound();
  }

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  return (
    <ProjectDetailClient
      row={row}
      editors={data.editors}
      isAdmin={isAdmin}
    />
  );
}

