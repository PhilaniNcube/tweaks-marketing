import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

const envPath = process.env.DOTENV_CONFIG_PATH || (require("fs").existsSync(".env.production") ? ".env.production" : ".env.local");
dotenv.config({ path: envPath });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: process.env.TURSO_DATABASE_URL?.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});


