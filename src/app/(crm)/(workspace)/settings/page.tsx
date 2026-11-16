import React from "react";
import { redirect } from "next/navigation";
import { getAdminCrmDashboardData } from "@/app/actions/crm";
import { getAdminUsersAction } from "@/app/actions/admin-users";
import { getServerSession } from "@/lib/auth-server";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rate Card, Business Rules & Team Access",
};

export default async function SettingsPage() {
  const session = await getServerSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const [data, adminUsersData] = await Promise.all([
    getAdminCrmDashboardData(),
    getAdminUsersAction(),
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
