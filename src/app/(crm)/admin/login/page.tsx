import React from "react";
import { redirect } from "next/navigation";
import { getServerSession, hasAnyAdminUser } from "@/lib/auth-server";
import { CrmLoginClient } from "./login-client";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const [session, hasAdmin] = await Promise.all([
    getServerSession(),
    hasAnyAdminUser(),
  ]);

  if (session?.user) {
    redirect("/dashboard");
  }

  return <CrmLoginClient isFirstTimeSetup={!hasAdmin} />;
}

