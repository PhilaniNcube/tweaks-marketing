import React from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { NewProjectClient } from "./new-project-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Project Intake",
};

export default async function NewProjectPage() {
  const data = await getAdminCrmDashboardData();

  return (
    <NewProjectClient
      services={data.services}
      rules={data.rateCardRules}
      institutions={data.institutions.filter((i) => i.status === "approved")}
      degreeLevels={data.degreeLevels.filter((d) => d.status === "approved")}
      editors={data.editors.filter((e) => e.isActive)}
    />
  );
}

