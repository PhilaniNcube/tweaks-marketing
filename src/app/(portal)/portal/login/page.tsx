import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { clients, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PortalLoginClient } from "./portal-login-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Sign In",
};

interface PortalLoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PortalLoginPage({
  searchParams,
}: PortalLoginPageProps) {
  const session = await getServerSession();
  if (session?.user?.email) {
    const normalizedSessionEmail = session.user.email.trim().toLowerCase();
    const role = (session.user as { role?: string }).role;
    if (role === "client") {
      redirect("/portal");
    }
    const [matchingClient] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.email, normalizedSessionEmail))
      .limit(1);
    if (matchingClient) {
      redirect("/portal");
    }
  }

  const resolvedParams = await searchParams;
  const emailParam = resolvedParams.email;
  const modeParam = resolvedParams.mode;

  const rawEmail = typeof emailParam === "string" ? emailParam.trim() : "";
  const cleanEmail = rawEmail.toLowerCase();

  let initialMode: "signin" | "signup" =
    modeParam === "signup" ? "signup" : "signin";

  if (cleanEmail) {
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, cleanEmail))
      .limit(1);
    initialMode = existingUser ? "signin" : "signup";
  }

  return (
    <PortalLoginClient initialEmail={rawEmail} initialMode={initialMode} />
  );
}
