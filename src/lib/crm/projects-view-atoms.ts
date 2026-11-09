import { atom } from "jotai";
import type { ProjectStage } from "@/db/schema";

export type ProjectViewMode = "table" | "kanban";

export type ProjectSortOrder =
  | "return_date_asc"
  | "return_date_desc"
  | "created_desc"
  | "fee_desc";

export type ProjectBoardOrder = Partial<Record<ProjectStage, string[]>>;

/** Cookie names, readable by the server so the first render is correct. */
export const PROJECT_VIEW_COOKIE = "projects_view";
export const PROJECT_SORT_COOKIE = "projects_sort";

/** Which presentation the projects workspace is using. */
export const projectViewModeAtom = atom<ProjectViewMode>("table");

/** Client-side sort applied before the board columns are built. */
export const projectSortOrderAtom = atom<ProjectSortOrder>("return_date_asc");

/**
 * Manual drag ordering per stage. Only ordering lives here — a project's stage
 * is always read from the server rows, never from this atom.
 */
export const projectBoardOrderAtom = atom<ProjectBoardOrder>({});

export function isProjectViewMode(
  value: string | null | undefined
): value is ProjectViewMode {
  return value === "table" || value === "kanban";
}

export function isProjectSortOrder(
  value: string | null | undefined
): value is ProjectSortOrder {
  return (
    value === "return_date_asc" ||
    value === "return_date_desc" ||
    value === "created_desc" ||
    value === "fee_desc"
  );
}

/** Persist a UI preference for the next server render (and page refresh). */
export function writeProjectPreferenceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax${secure}`;
}
