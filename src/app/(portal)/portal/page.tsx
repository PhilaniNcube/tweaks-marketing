import React from "react";
import { getClientPortalDashboardData } from "@/app/actions/portal";
import { PortalDashboardClient } from "./portal-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Project Dashboard",
};

export default async function ClientPortalPage() {
  const data = await getClientPortalDashboardData();

  return <PortalDashboardClient data={data} />;
}
