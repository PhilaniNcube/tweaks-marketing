import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDegreeSummary(
  degreeLevel?: string | null,
  degreeProgramme?: string | null,
  fallback = "Non-degree / Independent"
): string {
  const parts = [degreeLevel, degreeProgramme]
    .map((val) => val?.trim())
    .filter((val): val is string => Boolean(val && val.toUpperCase() !== "N/A"));
  return parts.length > 0 ? parts.join(" — ") : fallback;
}
