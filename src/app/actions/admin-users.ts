"use server";

import crypto from "crypto";
import { db } from "@/db";
import { user, account, verification, editors } from "@/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth-server";
import { hashPassword } from "better-auth/crypto";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { AdminInvitationEmail } from "@/components/emails/admin-invitation";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface PendingInviteItem {
  id: string;
  email: string;
  name?: string;
  role: string;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  inviteLink: string;
}

/**
 * Retrieves the roster of CRM users and active pending invitations.
 * Requires administrator privileges.
 */
export async function getAdminUsersAction() {
  await requireAdminSession();

  // 1. Fetch current registered users
  const usersList = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  // 2. Fetch pending, unexpired invitations from the verification table
  const now = new Date();
  const rawInvites = await db
    .select()
    .from(verification)
    .where(gt(verification.expiresAt, now));

  const baseUrl = getBaseUrl();
  const pendingInvites: PendingInviteItem[] = [];

  for (const inv of rawInvites) {
    if (!inv.identifier.startsWith("admin-invite:")) continue;
    try {
      const parsed = JSON.parse(inv.value);
      if (parsed.token) {
        pendingInvites.push({
          id: inv.id,
          email: parsed.email || inv.identifier.replace("admin-invite:", ""),
          name: parsed.name || undefined,
          role: parsed.role || "admin",
          token: parsed.token,
          invitedBy: parsed.invitedBy || "Admin",
          expiresAt: inv.expiresAt,
          inviteLink: `${baseUrl}/admin/invite?token=${encodeURIComponent(parsed.token)}`,
        });
      }
    } catch {
      // Ignore malformed json entries
    }
  }

  return {
    users: usersList,
    invites: pendingInvites,
  };
}

/**
 * Directly creates a new user account with immediate credentials.
 * Requires administrator privileges.
 */
export async function createAdminUserAction(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
}) {
  const session = await requireAdminSession();

  const cleanName = input.name.trim();
  const cleanEmail = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role || "admin";

  if (!cleanName) {
    return { success: false, error: "Full Name is required." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "A valid email address is required." };
  }
  if (!password || password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, cleanEmail))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      error: `A user with email ${cleanEmail} already exists.`,
    };
  }

  try {
    const userId = crypto.randomUUID().replace(/-/g, "");
    const accountId = crypto.randomUUID().replace(/-/g, "");
    const hashedPassword = await hashPassword(password);
    const now = new Date();

    // Insert user
    await db.insert(user).values({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // Insert credentials account
    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // Also sync to editors roster so they can be assigned documents if needed
    try {
      await db
        .insert(editors)
        .values({
          name: cleanName,
          email: cleanEmail,
          role,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: editors.email,
          set: {
            name: cleanName,
            role,
            isActive: true,
          },
        });
    } catch {
      // Best-effort editors sync
    }

    // Attempt to notify user via email if Resend is configured
    if (resend) {
      try {
        const baseUrl = getBaseUrl();
        await resend.emails.send({
          from: "Tweaks CRM <hello@tweaks.co.za>",
          to: [cleanEmail],
          subject: `Your Tweaks CRM account has been created`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #1B0ABD; margin-top: 0;">Welcome to Tweaks CRM</h2>
              <p>Hello ${cleanName},</p>
              <p>Your Tweaks CRM ${role === "admin" ? "Administrator" : "Editor"} account has been created by <strong>${session.user.email}</strong>.</p>
              <p><strong>Login details:</strong></p>
              <ul>
                <li><strong>Email:</strong> ${cleanEmail}</li>
                <li><strong>Role:</strong> ${role.toUpperCase()}</li>
                <li><strong>Login Portal:</strong> <a href="${baseUrl}/admin/login">${baseUrl}/admin/login</a></li>
              </ul>
              <p>You can sign in directly using the password provided to you.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Failed to send welcome email:", emailErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to create admin user:", err);
    return {
      success: false,
      error: err?.message || "Failed to create user account.",
    };
  }
}

/**
 * Creates an invitation token and sends an invitation email.
 * Requires administrator privileges.
 */
export async function inviteAdminUserAction(input: {
  name?: string;
  email: string;
  role: "admin" | "editor";
}) {
  const session = await requireAdminSession();

  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.name?.trim() || "";
  const role = input.role || "admin";

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "A valid email address is required." };
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, cleanEmail))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      error: `A user with email ${cleanEmail} already has an active account.`,
    };
  }

  try {
    const inviteId = crypto.randomUUID().replace(/-/g, "");
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date();

    const identifier = `admin-invite:${cleanEmail}`;
    const payload = JSON.stringify({
      token,
      email: cleanEmail,
      name: cleanName,
      role,
      invitedBy: session.user.email,
    });

    // Delete any previous pending invite for this email
    await db
      .delete(verification)
      .where(eq(verification.identifier, identifier));

    // Store new invite
    await db.insert(verification).values({
      id: inviteId,
      identifier,
      value: payload,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    const baseUrl = getBaseUrl();
    const inviteLink = `${baseUrl}/admin/invite?token=${encodeURIComponent(token)}`;

    let emailSent = false;
    if (resend) {
      try {
        const emailHtml = await render(
          AdminInvitationEmail({
            recipientName: cleanName,
            invitedByEmail: session.user.email || "Administrator",
            role,
            inviteUrl: inviteLink,
            expiresInDays: 7,
          })
        );

        await resend.emails.send({
          from: "Tweaks CRM <hello@tweaks.co.za>",
          to: [cleanEmail],
          subject: `Invitation to join Tweaks CRM as an ${role === "admin" ? "Administrator" : "Editor"}`,
          html: emailHtml,
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("Failed to send invitation email:", mailErr);
      }
    }

    return {
      success: true,
      inviteLink,
      emailSent,
      expiresAt,
    };
  } catch (err: any) {
    console.error("Failed to generate invite:", err);
    return {
      success: false,
      error: err?.message || "Failed to generate invite.",
    };
  }
}

/**
 * Revokes a pending invitation.
 * Requires administrator privileges.
 */
export async function revokeAdminInviteAction(inviteId: string) {
  await requireAdminSession();
  try {
    await db.delete(verification).where(eq(verification.id, inviteId));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to revoke invitation." };
  }
}

/**
 * Updates a user's role (admin <-> editor).
 * Protects an administrator from demoting themselves.
 */
export async function updateUserRoleAction(input: {
  userId: string;
  role: "admin" | "editor";
}) {
  const session = await requireAdminSession();

  if (session.user.id === input.userId) {
    return {
      success: false,
      error: "You cannot change your own administrator role.",
    };
  }

  try {
    await db
      .update(user)
      .set({
        role: input.role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, input.userId));

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user role." };
  }
}

/**
 * Deletes a user account.
 * Protects an administrator from deleting their own account.
 */
export async function deleteUserAction(userId: string) {
  const session = await requireAdminSession();

  if (session.user.id === userId) {
    return {
      success: false,
      error: "You cannot delete your own administrator account.",
    };
  }

  try {
    await db.delete(user).where(eq(user.id, userId));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete user." };
  }
}

/**
 * Verifies an invite token. Publicly accessible by invited recipients.
 */
export async function verifyAdminInviteTokenAction(token: string) {
  if (!token) {
    return { valid: false, error: "Missing invitation token." };
  }

  const now = new Date();
  const rawInvites = await db
    .select()
    .from(verification)
    .where(gt(verification.expiresAt, now));

  for (const inv of rawInvites) {
    if (!inv.identifier.startsWith("admin-invite:")) continue;
    try {
      const parsed = JSON.parse(inv.value);
      if (parsed.token === token) {
        return {
          valid: true,
          email: parsed.email,
          name: parsed.name || "",
          role: parsed.role || "admin",
          invitedBy: parsed.invitedBy || "Tweaks Admin",
          expiresAt: inv.expiresAt,
        };
      }
    } catch {
      // Ignore
    }
  }

  return {
    valid: false,
    error: "This invitation link is invalid or has expired.",
  };
}

/**
 * Completes the invitation acceptance process, setting the password and creating the account.
 */
export async function acceptAdminInviteAction(input: {
  token: string;
  name: string;
  password: string;
}) {
  const cleanName = input.name.trim();
  const password = input.password;

  if (!cleanName) {
    return { success: false, error: "Full Name is required." };
  }
  if (!password || password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  const now = new Date();
  const rawInvites = await db
    .select()
    .from(verification)
    .where(gt(verification.expiresAt, now));

  let matchedInvite: {
    invId: string;
    email: string;
    role: "admin" | "editor";
  } | null = null;

  for (const inv of rawInvites) {
    if (!inv.identifier.startsWith("admin-invite:")) continue;
    try {
      const parsed = JSON.parse(inv.value);
      if (parsed.token === input.token) {
        matchedInvite = {
          invId: inv.id,
          email: parsed.email,
          role: parsed.role || "admin",
        };
        break;
      }
    } catch {
      // Ignore
    }
  }

  if (!matchedInvite) {
    return {
      success: false,
      error: "Invitation is invalid or has expired.",
    };
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, matchedInvite.email))
    .limit(1);

  if (existingUser) {
    // Delete the invite token
    await db.delete(verification).where(eq(verification.id, matchedInvite.invId));
    return {
      success: false,
      error: "An account with this email already exists. Please log in.",
    };
  }

  try {
    const userId = crypto.randomUUID().replace(/-/g, "");
    const accountId = crypto.randomUUID().replace(/-/g, "");
    const hashedPassword = await hashPassword(password);

    // Create user
    await db.insert(user).values({
      id: userId,
      name: cleanName,
      email: matchedInvite.email,
      role: matchedInvite.role,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create credential account
    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // Clean up used invite token
    await db.delete(verification).where(eq(verification.id, matchedInvite.invId));

    // Also sync to editors roster
    try {
      await db
        .insert(editors)
        .values({
          name: cleanName,
          email: matchedInvite.email,
          role: matchedInvite.role,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: editors.email,
          set: {
            name: cleanName,
            role: matchedInvite.role,
            isActive: true,
          },
        });
    } catch {
      // Best-effort
    }

    return {
      success: true,
      email: matchedInvite.email,
    };
  } catch (err: any) {
    console.error("Failed to accept invite:", err);
    return {
      success: false,
      error: err?.message || "Failed to set up your account.",
    };
  }
}
