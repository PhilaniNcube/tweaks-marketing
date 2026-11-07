import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { count } from "drizzle-orm";

const resolvedBaseUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_BRANCH_URL
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const trustedOrigins = [
  "http://localhost:3000",
  "https://tweaks.co.za",
  "https://www.tweaks.co.za",
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_BRANCH_URL
    ? [`https://${process.env.VERCEL_BRANCH_URL}`]
    : []),
];

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
          const [existing] = await db
            .select({ total: count() })
            .from(schema.user);
          const totalUsers = existing?.total ?? 0;

          // First user created in the database becomes the initial Admin
          if (totalUsers === 0) {
            return {
              data: {
                ...newUser,
                role: "admin",
              },
            };
          }

          // Block public self-signup once an initial admin exists unless ALLOW_CRM_SIGNUP=true
          if (process.env.ALLOW_CRM_SIGNUP !== "true") {
            throw new APIError("FORBIDDEN", {
              message:
                "Public sign-up is disabled. Please ask an administrator to invite your account.",
            });
          }

          return { data: newUser };
        },
      },
    },
  },
  trustedOrigins,
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
