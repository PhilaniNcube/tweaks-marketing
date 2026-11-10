const PRODUCTION_URL = "https://www.tweaks.co.za";
const LOCAL_URL = "http://localhost:3000";

/**
 * Accepts `host`, `host/path`, or a full URL and returns a clean origin with
 * no trailing slash. Vercel's system env vars are host-only (no protocol).
 */
function normalizeUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

/** The explicit `NEXT_PUBLIC_APP_URL` override, if configured. */
export function getConfiguredAppUrl(): string | undefined {
  return normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
}

/**
 * Resolves the public base URL for the current deployment.
 *
 * Order:
 * 1. `NEXT_PUBLIC_APP_URL` — explicit override (set this to the production
 *    domain for production only, so previews fall through).
 * 2. Preview deployment — `VERCEL_URL` (the deployment-specific URL), then
 *    `VERCEL_BRANCH_URL` (stable branch alias).
 * 3. Production deployment — `VERCEL_PROJECT_PRODUCTION_URL`, then the
 *    canonical production domain.
 * 4. Local development — `http://localhost:3000`.
 *
 * Server-only: `VERCEL_*` variables are not exposed to the browser.
 */
export function getAppUrl(): string {
  const explicit = getConfiguredAppUrl();
  if (explicit) return explicit;

  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === "preview") {
    return (
      normalizeUrl(process.env.VERCEL_URL) ??
      normalizeUrl(process.env.VERCEL_BRANCH_URL) ??
      PRODUCTION_URL
    );
  }

  if (vercelEnv === "production") {
    return (
      normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
      PRODUCTION_URL
    );
  }

  // Running locally or on a non-Vercel host.
  const vercelUrl = normalizeUrl(process.env.VERCEL_URL);
  if (vercelUrl) return vercelUrl;

  return process.env.NODE_ENV === "production" ? PRODUCTION_URL : LOCAL_URL;
}

/**
 * Canonical base URL for metadata, `sitemap.xml` and `robots.txt`.
 * Falls back to the same deployment-aware resolver as `getAppUrl()`.
 */
export function getBaseUrl(): string {
  return normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL) ?? getAppUrl();
}

/**
 * Origins trusted by Better Auth. Includes the resolved app URL plus both
 * Vercel preview aliases and the apex/www production domains, so preview
 * logins work regardless of which alias the developer opens.
 */
export function getTrustedOrigins(): string[] {
  return Array.from(
    new Set(
      [
        LOCAL_URL,
        PRODUCTION_URL,
        "https://tweaks.co.za",
        getAppUrl(),
        normalizeUrl(process.env.VERCEL_URL),
        normalizeUrl(process.env.VERCEL_BRANCH_URL),
      ].filter((value): value is string => Boolean(value))
    )
  );
}
