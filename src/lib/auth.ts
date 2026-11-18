import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getAppUrl, getTrustedOrigins } from "@/lib/app-url";

const resolvedBaseUrl = process.env.BETTER_AUTH_URL || getAppUrl();

const trustedOrigins = Array.from(
  new Set([
    ...getTrustedOrigins(),
    ...(process.env.BETTER_AUTH_URL
      ? [process.env.BETTER_AUTH_URL.replace(/\/+$/, "")]
      : []),
  ])
);

export const auth = betterAuth({
  baseURL: resolvedBaseUrl,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "tweaks-crm-default-secret-key-minimum-32-chars-long",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "editor",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const [existingAdmin] = await db
            .select({ total: count() })
            .from(schema.user)
            .where(eq(schema.user.role, "admin"));
          const totalAdmins = existingAdmin?.total ?? 0;

          const normalizedEmail = (newUser.email || "").trim().toLowerCase();
          const [existingClient] = normalizedEmail
            ? await db
                .select()
                .from(schema.clients)
                .where(eq(schema.clients.email, normalizedEmail))
                .limit(1)
            : [];

          if (
            existingClient &&
            (totalAdmins > 0 || (newUser as { role?: string }).role === "client")
          ) {
            return {
              data: {
                ...newUser,
                email: normalizedEmail,
                role: "client",
              },
            };
          }

          // First admin created in the database becomes the initial Admin
          if (totalAdmins === 0) {
            return {
              data: {
                ...newUser,
                email: normalizedEmail,
                role: "admin",
              },
            };
          }

          // Block public self-signup once an initial admin exists unless ALLOW_CRM_SIGNUP=true
          if (process.env.ALLOW_CRM_SIGNUP !== "true") {
            throw new APIError("FORBIDDEN", {
              message:
                "No quote request was found for this email address. Please use the email address from your quote request.",
            });
          }

          return {
            data: {
              ...newUser,
              email: normalizedEmail,
            },
          };
        },
      },
    },
  },
  trustedOrigins,
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
