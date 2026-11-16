import React from "react";
import { redirect } from "next/navigation";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { PaymentsClient } from "./payments-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payments Ledger & PO Chasing",
};

export default async function PaymentsPage() {
  const data = await getAdminCrmDashboardData();
  if (!data.isAdmin) {
    redirect("/dashboard");
  }
  return <PaymentsClient rows={data.rows} kpis={data.kpis} />;
}

