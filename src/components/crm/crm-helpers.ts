import type { ProjectStage, PaymentOption, QuoteOutcome } from "@/db/schema";

export function formatZarFromCents(cents: number | null | undefined): string {
  const safe = typeof cents === "number" && !isNaN(cents) ? cents : 0;
  const rands = safe / 100;
  return `R${rands.toLocaleString("en-ZA", {
    minimumFractionDigits: rands % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export const STAGE_LABELS: Record<ProjectStage, string> = {
  enquiry: "Enquiry",
  quote_sent: "Quote Sent",
  accepted: "Awaiting Payment / Files",
  in_progress: "Editing in Progress",
  work_ready: "Quality Check / Work Ready",
  review: "72h Review Window",
  complete: "Complete",
  closed: "Closed",
  lost: "Lost / Declined",
};

export const KANBAN_STAGES: Array<{
  stage: ProjectStage;
  title: string;
  subtitle: string;
}> = [
  { stage: "enquiry", title: "Enquiry", subtitle: "New brief logged" },
  { stage: "quote_sent", title: "Quote Sent", subtitle: "Awaiting acceptance" },
  {
    stage: "accepted",
    title: "Awaiting Payment / Files",
    subtitle: "Accepted quote",
  },
  {
    stage: "in_progress",
    title: "Editing",
    subtitle: "Active editorial work",
  },
  {
    stage: "work_ready",
    title: "Quality Check / Ready",
    subtitle: "Package prepared",
  },
  {
    stage: "review",
    title: "Review Window",
    subtitle: "Delivered (72h window)",
  },
  { stage: "complete", title: "Complete", subtitle: "Signed off & certified" },
];

export const PAYMENT_OPTION_LABELS: Record<PaymentOption, string> = {
  full_payment: "Option 1: Full Payment",
  payment_plan: "Option 2: 50% Deposit + Plan",
  institutional_funding: "Option 3: Institutional PO",
};

export const QUOTE_OUTCOME_LABELS: Record<QuoteOutcome, string> = {
  draft: "Draft",
  awaiting_reply: "Awaiting Reply",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export type ReturnScheduleStatus = "completed" | "late" | "due_soon" | "on_track";

export function getReturnScheduleStatus(
  requestedReturnDate: string | null | undefined,
  stage: ProjectStage
): {
  status: ReturnScheduleStatus;
  label: string;
  daysDiff: number;
} {
  if (stage === "complete" || stage === "closed" || stage === "lost") {
    return { status: "completed", label: "Closed / Done", daysDiff: 0 };
  }

  if (!requestedReturnDate) {
    return { status: "on_track", label: "No Date", daysDiff: 99 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(requestedReturnDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return {
      status: "late",
      label: `${Math.abs(daysDiff)}d Late`,
      daysDiff,
    };
  }
  if (daysDiff <= 2) {
    return {
      status: "due_soon",
      label: daysDiff === 0 ? "Due Today" : `Due in ${daysDiff}d`,
      daysDiff,
    };
  }
  return {
    status: "on_track",
    label: `In ${daysDiff}d`,
    daysDiff,
  };
}

