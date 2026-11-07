import React from "react";
import { requireCrmSession } from "@/lib/auth-server";
import { CrmShell } from "@/components/crm/crm-shell";

export const dynamic = "force-dynamic";

export default async function CrmWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCrmSession();

  return (
    <CrmShell
      currentUser={{
        name: session.user.name || "Tweaks Admin",
        email: session.user.email,
        role: (session.user as { role?: string }).role || "admin",
      }}
    >
      {children}
    </CrmShell>
  );
}

