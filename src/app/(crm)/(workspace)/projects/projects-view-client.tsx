"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useTransition,
  useOptimistic,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  Search,
  LayoutList,
  Kanban,
  ArrowUpDown,
  PlusCircle,
  Lock,
  Unlock,
  AlertTriangle,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import {
  formatZarFromCents,
  KANBAN_STAGES,
  STAGE_LABELS,
  getReturnScheduleStatus,
  type ReturnScheduleStatus,
} from "@/components/crm/crm-helpers";
import {
  updateProjectStageQuickAction,
  assignProjectEditorAction,
} from "@/app/actions/crm";
import { ProjectAdminActions } from "@/components/crm/project-admin-actions";
import {
  PROJECT_SORT_COOKIE,
  PROJECT_VIEW_COOKIE,
  projectBoardOrderAtom,
  projectSortOrderAtom,
  projectViewModeAtom,
  writeProjectPreferenceCookie,
  type ProjectSortOrder,
  type ProjectViewMode,
} from "@/lib/crm/projects-view-atoms";
import type { ProjectStage, Editor } from "@/db/schema";
import type { getAdminCrmDashboardData } from "@/app/actions/crm";
import { toast } from "sonner";
import { motion } from "framer-motion";

type DashboardData = Awaited<ReturnType<typeof getAdminCrmDashboardData>>;
type EnrichedProjectRow = DashboardData["rows"][number];

type OptimisticStageUpdate = {
  projectId: string;
  stage: ProjectStage;
};

type DropTarget = {
  stage: ProjectStage;
  /** Card the dragged item should be inserted before, or null for the end. */
  beforeId: string | null;
};

/**
 * Works out where a dragged card should land inside a column by comparing the
 * pointer position against the midpoint of each rendered card.
 */
function getDropBeforeId(
  container: HTMLElement,
  clientY: number
): string | null {
  const cards = Array.from(
    container.querySelectorAll<HTMLElement>("[data-kanban-card-id]")
  );

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      return card.dataset.kanbanCardId ?? null;
    }
  }

  return null;
}

/**
 * Keep ?view= in the address bar in sync with the Jotai atom. This makes a
 * refresh resolve to the same view without a server round-trip.
 */
function updateProjectsViewUrl(view: ProjectViewMode) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.set("view", view);
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`
  );
}

// Layout effects run before paint on the client, but React warns if they run
// during server rendering.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface ProjectsViewClientProps {
  rows: EnrichedProjectRow[];
  editors: Editor[];
  institutions: string[];
  isAdmin: boolean;
  initialView: ProjectViewMode;
  initialSortOrder: ProjectSortOrder;
  initialStage: string;
}

export function ProjectsViewClient({
  rows,
  editors,
  institutions,
  isAdmin,
  initialView,
  initialSortOrder,
  initialStage,
}: ProjectsViewClientProps) {
  const router = useRouter();

  // Hydrate during render so SSR and the first client pass agree on the
  // server-provided preference. Layout effects below handle prop changes on
  // later client-side navigations.
  useHydrateAtoms([
    [projectViewModeAtom, initialView],
    [projectSortOrderAtom, initialSortOrder],
  ]);

  const [viewMode, setViewMode] = useAtom(projectViewModeAtom);
  const [sortBy, setSortBy] = useAtom(projectSortOrderAtom);
  const [boardOrder, setBoardOrder] = useAtom(projectBoardOrderAtom);

  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>(initialStage);
  const [scheduleFilter, setScheduleFilter] = useState<
    "all" | ReturnScheduleStatus
  >("all");
  const [editorFilter, setEditorFilter] = useState<string>("all");
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");

  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ProjectStage | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [draggedCardHeight, setDraggedCardHeight] = useState(0);
  const [isPending, startTransition] = useTransition();
  // Set when a drop is taking ownership of the drag cleanup. This stops the
  // later dragleave/dragend events from collapsing the gap before the
  // optimistic move has committed.
  const dropHandledRef = useRef(false);

  const clearDragState = () => {
    setDraggedProjectId(null);
    setDragOverStage(null);
    setDropTarget(null);
    setDraggedCardHeight(0);
  };

  useIsomorphicLayoutEffect(() => {
    setViewMode(initialView);
  }, [initialView, setViewMode]);

  useIsomorphicLayoutEffect(() => {
    setSortBy(initialSortOrder);
  }, [initialSortOrder, setSortBy]);

  const changeViewMode = (mode: ProjectViewMode) => {
    setViewMode(mode);
    writeProjectPreferenceCookie(PROJECT_VIEW_COOKIE, mode);
    updateProjectsViewUrl(mode);
  };

  // If a project's stage changed somewhere else (table dropdown, detail page,
  // another admin), discard stale manual-order entries on the next fresh
  // server render. Columns are always grouped by the row's real stage, so a
  // stale entry can never pull a card into the wrong column.
  useEffect(() => {
    setBoardOrder((prev) => {
      const stageById = new Map(
        rows.map((row) => [row.project.id, row.project.stage])
      );
      let changed = false;
      const next: typeof prev = {};

      for (const [stage, ids] of Object.entries(prev) as [
        ProjectStage,
        string[]
      ][]) {
        const kept = ids.filter((id) => stageById.get(id) === stage);
        if (kept.length !== ids.length) changed = true;
        if (kept.length > 0) next[stage] = kept;
      }

      return changed ? next : prev;
    });
  }, [rows, setBoardOrder]);

  // Move the card immediately while the server action is in flight. The
  // optimistic state reverts automatically if the action fails.
  const [optimisticRows, applyOptimisticStage] = useOptimistic<
    EnrichedProjectRow[],
    OptimisticStageUpdate
  >(rows, (currentRows, update) =>
    currentRows.map((row) =>
      row.project.id === update.projectId
        ? { ...row, project: { ...row.project, stage: update.stage } }
        : row
    )
  );

  // Exclude archived (closed/lost) unless explicitly filtered
  const activeRows = useMemo(() => {
    return optimisticRows.filter((row) => {
      if (row.project.archivedAt) {
        return false;
      }
      if (
        stageFilter === "all" &&
        (row.project.stage === "closed" || row.project.stage === "lost")
      ) {
        return false;
      }
      if (stageFilter !== "all" && row.project.stage !== stageFilter) {
        return false;
      }

      const sched = getReturnScheduleStatus(
        row.project.requestedReturnDate,
        row.project.stage
      );
      if (scheduleFilter !== "all" && sched.status !== scheduleFilter) {
        return false;
      }

      if (editorFilter !== "all") {
        if (editorFilter === "unassigned" && row.project.assignedEditorId) {
          return false;
        }
        if (
          editorFilter !== "unassigned" &&
          row.project.assignedEditorId !== editorFilter
        ) {
          return false;
        }
      }

      if (
        institutionFilter !== "all" &&
        row.institutionName !== institutionFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientName = row.client
          ? `${row.client.firstName} ${row.client.surname}`.toLowerCase()
          : "";
        const email = row.client?.email?.toLowerCase() || "";
        const title = row.project.researchTitle.toLowerCase();
        const quoteNum = row.quote?.quoteNumber?.toLowerCase() || "";
        const inst = row.institutionName.toLowerCase();
        if (
          !clientName.includes(q) &&
          !email.includes(q) &&
          !title.includes(q) &&
          !quoteNum.includes(q) &&
          !inst.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    optimisticRows,
    stageFilter,
    scheduleFilter,
    editorFilter,
    institutionFilter,
    searchQuery,
  ]);

  const sortedRows = useMemo(() => {
    const copy = [...activeRows];
    copy.sort((a, b) => {
      if (sortBy === "return_date_asc") {
        return (a.project.requestedReturnDate || "9999").localeCompare(
          b.project.requestedReturnDate || "9999"
        );
      }
      if (sortBy === "return_date_desc") {
        return (b.project.requestedReturnDate || "").localeCompare(
          a.project.requestedReturnDate || ""
        );
      }
      if (sortBy === "fee_desc") {
        return (b.quote?.totalFeeCents || 0) - (a.quote?.totalFeeCents || 0);
      }
      return (b.project.createdAt || "").localeCompare(
        a.project.createdAt || ""
      );
    });
    return copy;
  }, [activeRows, sortBy]);

  // Group the visible rows into their kanban columns, then apply any manual
  // ordering the user has created by dragging cards. Ids missing from the
  // manual order (new cards, filtered-in cards) keep their sorted fallback
  // position at the end of the column.
  const rowsByStage = useMemo(() => {
    const grouped = new Map<ProjectStage, EnrichedProjectRow[]>();

    for (const row of sortedRows) {
      const list = grouped.get(row.project.stage);
      if (list) {
        list.push(row);
      } else {
        grouped.set(row.project.stage, [row]);
      }
    }

    for (const [stage, list] of grouped) {
      const order = boardOrder[stage];
      if (!order) continue;

      const positionById = new Map(order.map((id, index) => [id, index]));
      list.sort(
        (a, b) =>
          (positionById.get(a.project.id) ?? Number.MAX_SAFE_INTEGER) -
          (positionById.get(b.project.id) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    return grouped;
  }, [sortedRows, boardOrder]);

  const getStageOrder = (
    order: Partial<Record<ProjectStage, string[]>>,
    stage: ProjectStage
  ): string[] => {
    const visibleIds = (rowsByStage.get(stage) ?? []).map(
      (row) => row.project.id
    );
    const stored = order[stage];
    if (!stored) return visibleIds;

    // Merge in any visible cards the stored order does not know about yet so
    // drops can be positioned relative to them too.
    const seen = new Set(stored);
    return [...stored, ...visibleIds.filter((id) => !seen.has(id))];
  };

  const handleStageDrop = (
    projectId: string,
    targetStage: ProjectStage,
    beforeId: string | null = null
  ) => {
    const current = optimisticRows.find((row) => row.project.id === projectId);
    if (!current) {
      clearDragState();
      return;
    }

    const sourceStage = current.project.stage;
    const isSameStage = sourceStage === targetStage;

    // Dropping a card directly above itself is a no-op.
    if (isSameStage && beforeId === projectId) {
      clearDragState();
      return;
    }

    const previousOrder = boardOrder;

    const reorder = (
      prev: Partial<Record<ProjectStage, string[]>>
    ): Partial<Record<ProjectStage, string[]>> => {
      const sourceOrder = getStageOrder(prev, sourceStage);
      const targetOrder = isSameStage
        ? sourceOrder
        : getStageOrder(prev, targetStage);

      // Remove the card first so its old slot collapses and every card at or
      // after the insertion point shifts down one position.
      const sourceIndex = sourceOrder.indexOf(projectId);
      if (sourceIndex !== -1) sourceOrder.splice(sourceIndex, 1);

      const targetIndex = targetOrder.indexOf(projectId);
      if (targetIndex !== -1) targetOrder.splice(targetIndex, 1);

      const insertAt = beforeId ? targetOrder.indexOf(beforeId) : -1;
      targetOrder.splice(
        insertAt === -1 ? targetOrder.length : insertAt,
        0,
        projectId
      );

      return isSameStage
        ? { ...prev, [targetStage]: targetOrder }
        : {
            ...prev,
            [sourceStage]: sourceOrder,
            [targetStage]: targetOrder,
          };
    };

    // Same-column reordering is purely visual, so no server round-trip.
    if (isSameStage) {
      clearDragState();
      setBoardOrder(reorder);
      return;
    }

    startTransition(async () => {
      // Apply the stage swap, the new slot and the drag cleanup together in
      // the same transition. If any of these landed in an earlier render the
      // gap would collapse and the cards below would visibly jump.
      applyOptimisticStage({ projectId, stage: targetStage });
      setBoardOrder(reorder);
      clearDragState();

      const res = await updateProjectStageQuickAction({
        projectId,
        stage: targetStage,
      });
      if (res.success) {
        toast.success(`Moved project to ${STAGE_LABELS[targetStage]}`);
      } else {
        // Roll the manual order back so the card returns to its source column.
        setBoardOrder(previousOrder);
        toast.error(res.error || "Failed to move project");
      }
    });
  };

  const handleAssignEditor = (projectId: string, editorId: string) => {
    startTransition(async () => {
      const res = await assignProjectEditorAction({
        projectId,
        editorId: editorId === "unassigned" ? null : editorId,
      });
      if (res.success) {
        toast.success("Editor assignment updated");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to assign editor");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-tweaks-blue">
            Projects &amp; Client Tracker
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Active Projects ({sortedRows.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Switch between the filterable Grid View and the drag-and-drop Kanban Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => changeViewMode("table")}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-zinc-400"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List / Grid
            </button>
            <button
              type="button"
              onClick={() => changeViewMode("kanban")}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-zinc-400"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              Kanban Pipeline
            </button>
          </div>

          <Link
            href="/projects/new"
            className="px-4 py-2 text-xs font-bold bg-tweaks-blue hover:bg-tweaks-red text-white flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Filter & Sorting Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, title, quote #, institution..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
          />
        </div>

        <select
          value={scheduleFilter}
          onChange={(e) =>
            setScheduleFilter(e.target.value as "all" | ReturnScheduleStatus)
          }
          className="px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
        >
          <option value="all">All Return Statuses</option>
          <option value="late">Late / Overdue</option>
          <option value="due_soon">Due Soon (≤ 2 days)</option>
          <option value="on_track">On Track</option>
        </select>

        <select
          value={editorFilter}
          onChange={(e) => setEditorFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
        >
          <option value="all">All Editors</option>
          <option value="unassigned">Unassigned Only</option>
          {editors.map((ed) => (
            <option key={ed.id} value={ed.id}>
              Editor: {ed.name}
            </option>
          ))}
        </select>

        <select
          value={institutionFilter}
          onChange={(e) => setInstitutionFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
        >
          <option value="all">All Institutions</option>
          {institutions.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => {
              const nextSort = e.target.value as ProjectSortOrder;
              setSortBy(nextSort);
              // Re-apply the chosen sort by discarding manual board positions.
              setBoardOrder({});
              writeProjectPreferenceCookie(PROJECT_SORT_COOKIE, nextSort);
            }}
            className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
          >
            <option value="return_date_asc">Sort: Return Date (Soonest)</option>
            <option value="return_date_desc">Sort: Return Date (Latest)</option>
            <option value="created_desc">Sort: Newest Logged</option>
            <option value="fee_desc">Sort: Highest Fee</option>
          </select>
        </div>
      </div>

      {/* Stage Filter Pills (for Table View) */}
      {viewMode === "table" && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStageFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
              stageFilter === "all"
                ? "bg-tweaks-blue text-white border-tweaks-blue"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
            }`}
          >
            All Active Stages
          </button>
          {KANBAN_STAGES.map((st) => (
            <button
              key={st.stage}
              type="button"
              onClick={() => setStageFilter(st.stage)}
              className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
                stageFilter === st.stage
                  ? "bg-tweaks-blue text-white border-tweaks-blue"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {st.title}
            </button>
          ))}
        </div>
      )}

      {/* VIEW 1: FILTERABLE DATA TABLE / GRID VIEW */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Client &amp; Research Work</th>
                <th className="py-3 px-3">Institution &amp; Degree</th>
                <th className="py-3 px-3">Return Schedule</th>
                <th className="py-3 px-3">Assigned Editor</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-3">Fee / Release Gate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {sortedRows.map((row) => {
                const sched = getReturnScheduleStatus(
                  row.project.requestedReturnDate,
                  row.project.stage
                );
                return (
                  <tr
                    key={row.project.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/projects/${row.project.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-tweaks-blue"
                        >
                          {row.client
                            ? `${row.client.firstName} ${row.client.surname}`
                            : "Client"}
                        </Link>
                        {row.project.isDuplicateFlag &&
                          !row.project.duplicateResolved && (
                            <span
                              title="Duplicate submission within 24h"
                              className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5"
                            >
                              <AlertTriangle className="h-2.5 w-2.5" /> 24h Dup
                            </span>
                          )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {row.project.researchTitle}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {row.quote?.quoteNumber} • {row.project.pageCount} pages
                        ({row.project.deliverySpeed})
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200">
                        {row.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {row.project.degreeLevel} — {row.project.degreeProgramme}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {row.project.requestedReturnDate}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold mt-1 ${
                          sched.status === "late"
                            ? "bg-red-100 text-red-700"
                            : sched.status === "due_soon"
                              ? "bg-amber-100 text-amber-800"
                              : sched.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {sched.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <select
                          disabled={isPending}
                          value={row.project.assignedEditorId || "unassigned"}
                          onChange={(e) =>
                            handleAssignEditor(row.project.id, e.target.value)
                          }
                          className="px-2 py-1 text-[11px] border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium"
                        >
                          <option value="unassigned">Unassigned</option>
                          {editors.map((ed) => (
                            <option key={ed.id} value={ed.id}>
                              {ed.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        disabled={isPending}
                        value={row.project.stage}
                        onChange={(e) =>
                          handleStageDrop(
                            row.project.id,
                            e.target.value as ProjectStage
                          )
                        }
                        className="px-2.5 py-1 text-[11px] font-bold bg-tweaks-blue/10 text-tweaks-blue border border-tweaks-blue/20"
                      >
                        {Object.entries(STAGE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatZarFromCents(row.quote?.totalFeeCents)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Bal: {formatZarFromCents(row.quote?.balanceCents)}
                      </div>
                      <div className="mt-1">
                        {row.project.releaseWork ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5">
                            <Unlock className="h-2.5 w-2.5" /> Gate Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5">
                            <Lock className="h-2.5 w-2.5" /> Gate Locked
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                          <ProjectAdminActions
                            projectId={row.project.id}
                            archived={!!row.project.archivedAt}
                            isAdmin={isAdmin}
                            compact
                          />
                        )}
                        {row.quote && (
                          <Link
                            href={`/quote/${row.quote.token}`}
                            target="_blank"
                            title="Open Client Quote Link"
                            className="p-1.5 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-tweaks-blue"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/projects/${row.project.id}`}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold hover:bg-tweaks-blue transition-colors"
                        >
                          Workspace
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-500 text-xs"
                  >
                    No projects match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: KANBAN / PIPELINE BOARD (DRAG AND DROP) */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100dvh_-_18rem)] min-h-[560px]">
          {KANBAN_STAGES.map((col) => {
            const colProjects = rowsByStage.get(col.stage) ?? [];
            const isOver = dragOverStage === col.stage;

            return (
              <div
                key={col.stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!draggedProjectId || dropHandledRef.current) return;
                  const beforeId = getDropBeforeId(e.currentTarget, e.clientY);
                  setDragOverStage(col.stage);
                  setDropTarget((prev) =>
                    prev?.stage === col.stage && prev.beforeId === beforeId
                      ? prev
                      : { stage: col.stage, beforeId }
                  );
                }}
                onDragLeave={(e) => {
                  if (dropHandledRef.current) return;
                  if (
                    e.relatedTarget &&
                    e.currentTarget.contains(e.relatedTarget as Node)
                  ) {
                    return;
                  }
                  setDragOverStage(null);
                  setDropTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!draggedProjectId) return;
                  // Claim the drag cleanup so dragleave/dragend cannot collapse
                  // the gap before the optimistic move commits.
                  dropHandledRef.current = true;
                  // Use the slot currently shown to the user so the card lands
                  // exactly where the gap was opened, even mid-animation.
                  const beforeId =
                    dropTarget?.stage === col.stage
                      ? dropTarget.beforeId
                      : getDropBeforeId(e.currentTarget, e.clientY);
                  handleStageDrop(draggedProjectId, col.stage, beforeId);
                }}
                className={`w-72 shrink-0 flex flex-col border transition-colors ${
                  isOver
                    ? "border-tweaks-blue bg-tweaks-blue/5"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-900/50"
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      {col.title}
                    </h3>
                    <p className="text-[10px] text-slate-400">{col.subtitle}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-black bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Stack */}
                <div className="p-2.5 space-y-2.5 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                  {colProjects.map((row) => {
                    const sched = getReturnScheduleStatus(
                      row.project.requestedReturnDate,
                      row.project.stage
                    );
                    const showDropSlot =
                      dropTarget?.stage === col.stage &&
                      dropTarget.beforeId === row.project.id;
                    return (
                      <React.Fragment key={row.project.id}>
                        {showDropSlot && (
                          <div
                            aria-hidden
                            style={{ height: draggedCardHeight }}
                            className="border-2 border-dashed border-tweaks-blue/40 bg-tweaks-blue/5"
                          />
                        )}
                        <motion.div
                          layout="position"
                          transition={{
                            layout: { duration: 0.18, ease: "easeOut" },
                          }}
                        >
                      <div
                        data-kanban-card-id={row.project.id}
                        draggable
                        onDragStart={(e) => {
                          dropHandledRef.current = false;
                          setDraggedProjectId(row.project.id);
                          setDraggedCardHeight(
                            e.currentTarget.getBoundingClientRect().height
                          );
                        }}
                        onDragEnd={() => {
                          // A drop owns the cleanup and keeps the gap until the
                          // optimistic move commits; only cancelled drags clear
                          // here. The flag resets on the next drag start.
                          if (dropHandledRef.current) return;
                          clearDragState();
                        }}
                        className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 shadow-2xs hover:border-tweaks-blue cursor-grab active:cursor-grabbing space-y-2.5 ${
                          draggedProjectId === row.project.id
                            ? "opacity-40"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/projects/${row.project.id}`}
                            className="text-xs font-bold text-slate-900 dark:text-white hover:text-tweaks-blue leading-snug"
                          >
                            {row.client
                              ? `${row.client.firstName} ${row.client.surname}`
                              : "Client"}
                          </Link>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${
                              sched.status === "late"
                                ? "bg-red-100 text-red-700"
                                : sched.status === "due_soon"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {sched.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                          {row.project.researchTitle}
                        </p>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span className="truncate max-w-[140px]">
                            {row.institutionName}
                          </span>
                          <span className="font-mono">
                            {row.project.pageCount}p •{" "}
                            {row.project.deliverySpeed}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatZarFromCents(row.quote?.totalFeeCents)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {row.assignedEditor
                              ? `Ed: ${row.assignedEditor.name}`
                              : "Unassigned"}
                          </span>
                        </div>
                      </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}

                  {dropTarget?.stage === col.stage &&
                    dropTarget.beforeId === null && (
                      <div
                        aria-hidden
                        style={{ height: draggedCardHeight }}
                        className="border-2 border-dashed border-tweaks-blue/40 bg-tweaks-blue/5"
                      />
                    )}

                  {colProjects.length === 0 &&
                    dropTarget?.stage !== col.stage && (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800">
                      Drag project card here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

