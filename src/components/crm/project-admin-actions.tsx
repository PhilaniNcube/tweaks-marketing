"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  setProjectArchivedAction,
  deleteProjectAction,
} from "@/app/actions/crm";
import { toast } from "sonner";

interface ProjectAdminActionsProps {
  projectId: string;
  archived: boolean;
  isAdmin: boolean;
  /** Compact icon buttons for table rows. */
  compact?: boolean;
  /** Where to send the admin after a permanent delete. */
  redirectTo?: string;
}

export function ProjectAdminActions({
  projectId,
  archived,
  isAdmin,
  compact = false,
  redirectTo,
}: ProjectAdminActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isAdmin) return null;

  const handleToggleArchive = () => {
    startTransition(async () => {
      const res = await setProjectArchivedAction({
        projectId,
        archived: !archived,
      });
      if (res.success) {
        toast.success(archived ? "Project restored" : "Project archived");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update archive status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProjectAction(projectId);
      if (res.success) {
        setConfirmDelete(false);
        toast.success("Project permanently deleted");
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete project");
      }
    });
  };

  const deleteDialog = confirmDelete ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`delete-project-title-${projectId}`}
    >
      <div className="w-full max-w-md space-y-4 border border-slate-200 bg-white p-5 text-left shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="space-y-1">
            <h3
              id={`delete-project-title-${projectId}`}
              className="text-sm font-black text-slate-900 dark:text-white"
            >
              Delete this project permanently?
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              This permanently deletes the project together with its quote,
              quote items, payments, reminder logs, and certificate. The client
              record is kept. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-bold border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (compact) {
    return (
      <>
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleArchive}
            disabled={isPending}
            title={archived ? "Restore project" : "Archive project"}
            aria-label={archived ? "Restore project" : "Archive project"}
            className="p-1.5 border border-slate-200 text-slate-500 hover:text-tweaks-blue hover:border-tweaks-blue cursor-pointer disabled:opacity-50 dark:border-zinc-700"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : archived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            title="Delete project permanently"
            aria-label="Delete project permanently"
            className="p-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 cursor-pointer disabled:opacity-50 dark:border-zinc-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 border border-red-200 bg-red-50/40 p-5 sm:flex-row sm:items-center dark:border-red-900/60 dark:bg-red-950/10">
        <div className="space-y-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Project Administration
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
            Archive removes this project from the active pipeline while keeping
            all records in the Archive. Delete permanently removes the project,
            quote, payments, and certificate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleArchive}
            disabled={isPending}
            className="px-3 py-2 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : archived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            {archived ? "Restore Project" : "Archive Project"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="px-3 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Project
          </button>
        </div>
      </div>
      {deleteDialog}
    </>
  );
}
