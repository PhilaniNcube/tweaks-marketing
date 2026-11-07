import React from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { PaymentsClient } from "./payments-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payments Ledger & PO Chasing",
};

export default async function PaymentsPage() {
  const data = await getAdminCrmDashboardData();
  return <PaymentsClient rows={data.rows} kpis={data.kpis} />;
}

