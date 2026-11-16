import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { EditQuoteClient } from "./edit-quote-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Quote",
};

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminCrmDashboardData();

  if (!data.isAdmin) {
    redirect("/dashboard");
  }

  const row = data.rows.find((r) => r.quote?.id === id);

  if (!row || !row.quote) {
    notFound();
  }

  return (
    <EditQuoteClient
      row={row}
      services={data.services.filter((service) => service.isActive)}
      rules={data.rateCardRules.filter((rule) => rule.isActive)}
      degreeLevels={data.degreeLevels.filter(
        (level) => level.status === "approved"
      )}
    />
  );
}
