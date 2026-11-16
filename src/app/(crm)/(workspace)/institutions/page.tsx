import React from "react";
import { redirect } from "next/navigation";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { InstitutionsClient } from "./institutions-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Institutions Directory",
};

export default async function InstitutionsPage() {
  const data = await getAdminCrmDashboardData();
  if (!data.isAdmin) {
    redirect("/dashboard");
  }
  return (
    <InstitutionsClient
      institutions={data.institutions}
      rows={data.rows}
    />
  );
}

