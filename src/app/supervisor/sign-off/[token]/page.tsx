import React from "react";
import { getSupervisorSignOffRequest } from "@/app/actions/supervisor";
import { SupervisorConfirmClient } from "./supervisor-confirm-client";

export default async function SupervisorSignOffPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const requestData = await getSupervisorSignOffRequest(token);

  if (!requestData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 text-center space-y-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Sign-Off Link Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            This supervisor confirmation link is not recognised or may have
            expired. Please contact{" "}
            <a
              href="mailto:hello@tweaks.co.za"
              className="text-tweaks-blue underline"
            >
              hello@tweaks.co.za
            </a>{" "}
            if you need assistance.
          </p>
        </div>
      </div>
    );
  }

  return <SupervisorConfirmClient token={token} data={requestData} />;
}

