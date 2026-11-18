import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Client Portal",
    template: "%s | Tweaks Client Portal",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLayout({
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
