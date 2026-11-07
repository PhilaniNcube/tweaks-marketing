import React from "react";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { getAdminUsersAction } from "@/app/actions/admin-users";
import { getServerSession } from "@/lib/auth-server";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rate Card, Business Rules & Team Access",
};

export default async function SettingsPage() {
  const [data, adminUsersData, session] = await Promise.all([
    getAdminCrmDashboardData(),
    getAdminUsersAction(),
    getServerSession(),
  ]);

  return (
    <SettingsClient
      services={data.services}
      rules={data.rateCardRules}
      settings={data.settings}
      editors={data.editors}
      pendingInstitutions={data.pendingInstitutions}
      pendingDegreeLevels={data.pendingDegreeLevels}
      teamUsers={adminUsersData.users}
      pendingInvites={adminUsersData.invites}
      currentUserId={session?.user?.id}
    />
  );
}
