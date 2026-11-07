import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Tweaks CRM",
    template: "%s | Tweaks CRM",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {children}
    </div>
  );
}

