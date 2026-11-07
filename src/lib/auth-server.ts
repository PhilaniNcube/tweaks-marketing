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
 * requests to /admin/login.
 */
export async function requireCrmSession() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/admin/login");
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
 * Checks whether any user exists in the database yet.
 * Used to allow first-time initial admin setup on /admin/login when the user table is empty,
 * while locking public sign-up once an admin account has been created.
 */
export async function hasAnyAdminUser(): Promise<boolean> {
  try {
    const [result] = await db.select({ value: count() }).from(userTable);
    return (result?.value ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Promotes the very first created user to role = "admin".
 */
export async function ensureFirstUserIsAdmin(userId: string) {
  const [result] = await db.select({ value: count() }).from(userTable);
  if ((result?.value ?? 0) <= 1) {
    await db
      .update(userTable)
      .set({ role: "admin" })
      .where(eq(userTable.id, userId));
  }
}

