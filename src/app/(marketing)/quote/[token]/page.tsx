import React, { Suspense } from "react";
import Link from "next/link";
import { getQuotePageDataByToken } from "@/app/actions/crm";
import { QuotePageClient } from "./quote-page-client";

export default async function ClientQuoteAndStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getQuotePageDataByToken(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 text-center space-y-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Quote Link Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            We could not find a quotation matching this link. Please check the
            link in your email or WhatsApp, or request a fresh quote below.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-block bg-tweaks-blue text-white px-6 py-3 text-sm font-bold"
            >
              Request a New Quote
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          Loading your quotation and project portal...
        </div>
      }
    >
      <QuotePageClient token={token} initialData={data} />
    </Suspense>
  );
}
