import React from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { QuotesClient } from "./quotes-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quotes Management",
};

export default async function QuotesPage() {
  const data = await getAdminCrmDashboardData();
  return <QuotesClient rows={data.rows} />;
}

