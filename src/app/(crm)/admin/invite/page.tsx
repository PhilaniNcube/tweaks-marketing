import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { verifyAdminInviteTokenAction } from "@/app/actions/admin-users";
import { AdminInviteClient } from "./invite-client";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accept Team Invitation | Tweaks CRM",
};

interface AdminInvitePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminInvitePage({ searchParams }: AdminInvitePageProps) {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const tokenParam = resolvedParams.token;
  const token = typeof tokenParam === "string" ? tokenParam : "";

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Missing Invitation Token
          </h1>
          <p className="text-xs text-slate-500">
            No invitation token was provided in the link. Please check the full link provided by your administrator.
          </p>
          <div className="pt-2">
            <Link href="/admin/login">
              <Button className="w-full bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold rounded-none">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verification = await verifyAdminInviteTokenAction(token);

  if (!verification.valid) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Invalid or Expired Invitation
          </h1>
          <p className="text-xs text-slate-500">
            {verification.error || "This invitation link is invalid or has expired. Please ask an administrator to send a new invitation."}
          </p>
          <div className="pt-2">
            <Link href="/admin/login">
              <Button className="w-full bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold rounded-none">
                Go to CRM Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminInviteClient
      token={token}
      email={verification.email!}
      initialName={verification.name}
      role={verification.role!}
      invitedBy={verification.invitedBy!}
    />
  );
}
