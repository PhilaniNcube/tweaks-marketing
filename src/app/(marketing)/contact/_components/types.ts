import type { ContactFormData } from "@/lib/validations/contact";
import type { Service, RateCardRule } from "@/db/schema";

export interface LookupInstitution {
  id: string;
  name: string;
  shortName?: string | null;
}

export interface LookupDegreeLevel {
  id: string;
  designator: string;
  category?: string;
}

export interface ContactLookupsData {
  services: Service[];
  rules: RateCardRule[];
  institutions: LookupInstitution[];
  degreeLevels: LookupDegreeLevel[];
  settings: Record<string, string>;
}

export interface ContactInitialDefaults {
  services: string[];
  pageCount?: number;
  deliverySpeed: "standard" | "express";
  todayIso: string;
  formTime: string;
}

export type ContactFormValues = ContactFormData & { file?: FileList };

