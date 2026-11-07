import React from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rate Card & Business Rules",
};

export default async function SettingsPage() {
  const data = await getAdminCrmDashboardData();
  return (
    <SettingsClient
      services={data.services}
      rules={data.rateCardRules}
      settings={data.settings}
      editors={data.editors}
      pendingInstitutions={data.pendingInstitutions}
      pendingDegreeLevels={data.pendingDegreeLevels}
    />
  );
}

