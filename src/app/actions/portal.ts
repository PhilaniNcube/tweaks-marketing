"use server";

import crypto from "crypto";
import { db } from "@/db";
import {
  clients,
  projects,
  quotes,
  quoteItems,
  payments,
  certificates,
  institutions,
  services,
  user,
  account,
  type Client,
  type Quote,
  type QuoteItem,
  type Payment,
  type Certificate,
  type Project,
} from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { requireClientPortalSession } from "@/lib/auth-server";

export type ClientPortalProject = Omit<
  Project,
  | "internalNotes"
  | "isDuplicateFlag"
  | "duplicateOfProjectId"
  | "duplicateResolved"
  | "assignedEditorId"
>;

export interface ClientPortalProjectItem {
  project: ClientPortalProject;
  quote: Quote | null;
  items: QuoteItem[];
  payments: Payment[];
  certificate: Certificate | null;
  institutionName: string;
  includesReferencingReport: boolean;
}

export interface ClientPortalDashboardData {
  sessionUser: {
    name: string;
    email: string;
    role: string;
  };
  client: Client | null;
  projects: ClientPortalProjectItem[];
}

/**
 * Checks whether an email address has an existing CRM client record (submitted brief/quote)
 * and whether they have already registered a portal login account.
 */
export async function checkClientEmailStatusAction(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      hasClientRecord: false,
      hasUserAccount: false,
    };
  }

  const [[clientRow], [userRow]] = await Promise.all([
    db
      .select({
        id: clients.id,
        firstName: clients.firstName,
      })
      .from(clients)
      .where(eq(clients.email, cleanEmail))
      .limit(1),
    db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, cleanEmail))
      .limit(1),
  ]);

  return {
    hasClientRecord: Boolean(clientRow),
    hasUserAccount: Boolean(userRow),
    clientFirstName: clientRow?.firstName,
  };
}

/**
 * Creates a client portal account gated to emails that already have a quote request
 * in the `clients` table.
 */
export async function registerClientPortalAccountAction(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const cleanEmail = input.email.trim().toLowerCase();
  const password = input.password;

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      success: false as const,
      error: "Please enter a valid email address.",
    };
  }

  if (!password || password.length < 8) {
    return {
      success: false as const,
      error: "Password must be at least 8 characters long.",
    };
  }

  const [existingClient] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, cleanEmail))
    .limit(1);

  if (!existingClient) {
    return {
      success: false as const,
      error:
        "We could not find a project or quote request under this email address. Please use the exact email address you entered when requesting your quote.",
    };
  }

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, cleanEmail))
    .limit(1);

  if (existingUser) {
    return {
      success: false as const,
      code: "ACCOUNT_EXISTS" as const,
      error:
        "An account for this email already exists. Please sign in with your password.",
    };
  }

  try {
    const userId = crypto.randomUUID().replace(/-/g, "");
    const accountId = crypto.randomUUID().replace(/-/g, "");
    const hashedPassword = await hashPassword(password);
    const now = new Date();
    const displayName =
      input.name?.trim() ||
      `${existingClient.firstName} ${existingClient.surname}`.trim() ||
      cleanEmail.split("@")[0];

    await db.insert(user).values({
      id: userId,
      name: displayName,
      email: cleanEmail,
      role: "client",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true as const,
      email: cleanEmail,
    };
  } catch (error) {
    console.error("Failed to register client portal account:", error);
    return {
      success: false as const,
      error: "Failed to create your account. Please try again.",
    };
  }
}

function stripInternalProjectFields(proj: Project): ClientPortalProject {
  const publicProject: Partial<Project> = { ...proj };
  delete publicProject.internalNotes;
  delete publicProject.isDuplicateFlag;
  delete publicProject.duplicateOfProjectId;
  delete publicProject.duplicateResolved;
  delete publicProject.assignedEditorId;
  return publicProject as ClientPortalProject;
}

/**
 * Loads the authenticated client's own projects, quotes, payments, and certificates,
 * strictly scoped to their session email address.
 */
export async function getClientPortalDashboardData(): Promise<ClientPortalDashboardData> {
  const session = await requireClientPortalSession();
  const userEmail = (session.user.email || "").trim().toLowerCase();
  const userRole = (session.user as { role?: string }).role || "client";

  const sessionUser = {
    name: session.user.name || userEmail.split("@")[0] || "Client",
    email: userEmail,
    role: userRole,
  };

  if (!userEmail) {
    return {
      sessionUser,
      client: null,
      projects: [],
    };
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, userEmail))
    .limit(1);

  if (!client) {
    return {
      sessionUser,
      client: null,
      projects: [],
    };
  }

  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, client.id))
    .orderBy(desc(projects.createdAt));

  if (clientProjects.length === 0) {
    return {
      sessionUser,
      client,
      projects: [],
    };
  }

  const projectIds = clientProjects.map((p) => p.id);

  const [
    clientQuotes,
    allItems,
    clientPayments,
    projectCertificates,
    allInstitutions,
    allServices,
  ] = await Promise.all([
    db
      .select()
      .from(quotes)
      .where(eq(quotes.clientId, client.id))
      .orderBy(desc(quotes.createdAt)),
    db
      .select()
      .from(quoteItems)
      .where(inArray(quoteItems.projectId, projectIds)),
    db
      .select()
      .from(payments)
      .where(eq(payments.clientId, client.id))
      .orderBy(desc(payments.createdAt)),
    db
      .select()
      .from(certificates)
      .where(inArray(certificates.projectId, projectIds)),
    db.select().from(institutions),
    db.select().from(services),
  ]);

  const mappedProjects: ClientPortalProjectItem[] = clientProjects.map(
    (proj) => {
      const publicProject = stripInternalProjectFields(proj);

      const latestQuote =
        clientQuotes.find((q) => q.projectId === proj.id) || null;
      const items = latestQuote
        ? allItems.filter((item) => item.quoteId === latestQuote.id)
        : allItems.filter((item) => item.projectId === proj.id);
      const successfulPayments = clientPayments.filter(
        (p) => p.projectId === proj.id && p.status === "success"
      );
      const certificate =
        projectCertificates.find((c) => c.projectId === proj.id) || null;

      let institutionName =
        proj.institutionOther ||
        client.institutionOther ||
        (proj.isUniversityEnrolled === false
          ? "Independent Researcher"
          : "University");
      if (proj.institutionId) {
        const inst = allInstitutions.find((i) => i.id === proj.institutionId);
        if (inst) institutionName = inst.name;
      }

      const includesReferencingReport = items.some((item) => {
        const svc = allServices.find((s) => s.id === item.serviceId);
        return (
          svc?.includesReferencingReport ||
          item.serviceName.toLowerCase().includes("reference")
        );
      });

      return {
        project: publicProject,
        quote: latestQuote,
        items,
        payments: successfulPayments,
        certificate,
        institutionName,
        includesReferencingReport,
      };
    }
  );

  return {
    sessionUser,
    client,
    projects: mappedProjects,
  };
}
