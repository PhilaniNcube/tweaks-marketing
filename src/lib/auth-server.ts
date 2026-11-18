import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { count, eq } from "drizzle-orm";

/**
 * Retrieves the current Better Auth session on the server.
 */
export async function getServerSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Protects a Server Component or Server Action, redirecting unauthenticated
 * requests to /admin/login and client accounts to /portal.
 */
export async function requireCrmSession() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role === "client") {
    redirect("/portal");
  }
  return session;
}

/**
 * Protects a Client Portal Server Component or Server Action, redirecting
 * unauthenticated requests to /portal/login.
 */
export async function requireClientPortalSession() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/portal/login");
  }
  return session;
}

/**
 * Requires an active session with role = "admin".
 */
export async function requireAdminSession() {
  const session = await requireCrmSession();
  if (session.user.role !== "admin") {
    throw new Error("Unauthorized: Administrator permissions required.");
  }
  return session;
}

/**
 * Checks whether any admin user exists in the database yet.
 * Used to allow first-time initial admin setup on /admin/login when no admin exists,
 * while locking public CRM sign-up once an admin account has been created.
 */
export async function hasAnyAdminUser(): Promise<boolean> {
  try {
    const [result] = await db
      .select({ value: count() })
      .from(userTable)
      .where(eq(userTable.role, "admin"));
    return (result?.value ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Promotes the very first created admin user to role = "admin" if no other admin exists.
 */
export async function ensureFirstUserIsAdmin(userId: string) {
  const admins = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.role, "admin"))
    .limit(2);
  if (admins.length === 0) {
    await db
      .update(userTable)
      .set({ role: "admin" })
      .where(eq(userTable.id, userId));
  }
}

