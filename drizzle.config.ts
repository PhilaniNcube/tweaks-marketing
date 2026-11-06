import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.TURSO_DATABASE_URL || "file:local.db";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: dbUrl.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: {
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});



