import { db } from "@/db";
import {
  quickbooksTokens,
  quotes,
  quoteItems,
  projects,
  clients,
  services,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const INTUIT_AUTH_ENDPOINT =
  "https://appcenter.intuit.com/connect/oauth2";
const INTUIT_TOKEN_ENDPOINT =
  "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

function getQuickbooksConfig() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID || "";
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET || "";
  const environment =
    process.env.QUICKBOOKS_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  const redirectUri =
    process.env.QUICKBOOKS_REDIRECT_URI ||
    `${siteUrl.replace(/\/$/, "")}/api/quickbooks/callback`;

  const apiBaseUrl =
    environment === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

  return {
    clientId,
    clientSecret,
    environment: environment as "sandbox" | "production",
    redirectUri,
    apiBaseUrl,
  };
}

/**
 * Generates the Intuit OAuth 2.0 authorization URL to connect QuickBooks Online.
 */
export function getQuickbooksConnectUrl(state = "tweaks-crm"): string | null {
  const { clientId, redirectUri } = getQuickbooksConfig();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: redirectUri,
    state,
  });

  return `${INTUIT_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Exchanges the OAuth 2.0 authorization code for access and refresh tokens
 * and persists them in the quickbooks_tokens table.
 */
export async function exchangeQuickbooksCodeForTokens(
  code: string,
  realmId: string
) {
  const { clientId, clientSecret, redirectUri, environment } =
    getQuickbooksConfig();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing QUICKBOOKS_CLIENT_ID or QUICKBOOKS_CLIENT_SECRET environment variables."
    );
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(INTUIT_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`QuickBooks token exchange failed: ${errText}`);
  }

  const tokenData = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
  };

  const now = Date.now();
  const accessExpiresAt = new Date(
    now + (tokenData.expires_in || 3600) * 1000
  ).toISOString();
  const refreshExpiresAt = new Date(
    now + (tokenData.x_refresh_token_expires_in || 8726400) * 1000
  ).toISOString();
  const nowIso = new Date(now).toISOString();

  await db
    .insert(quickbooksTokens)
    .values({
      realmId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      accessTokenExpiresAt: accessExpiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
      environment,
      updatedAt: nowIso,
    })
    .onConflictDoUpdate({
      target: quickbooksTokens.realmId,
      set: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accessTokenExpiresAt: accessExpiresAt,
        refreshTokenExpiresAt: refreshExpiresAt,
        environment,
        updatedAt: nowIso,
      },
    });
}

/**
 * Retrieves a valid QuickBooks Online access token, automatically refreshing
 * if the stored token is expired or within 5 minutes of expiring.
 */
export async function getValidQuickbooksSession() {
  const [tokenRow] = await db.select().from(quickbooksTokens).limit(1);
  if (!tokenRow) return null;

  const { clientId, clientSecret, apiBaseUrl } = getQuickbooksConfig();
  const expiresAtMs = new Date(tokenRow.accessTokenExpiresAt).getTime();

  if (Date.now() + 5 * 60 * 1000 < expiresAtMs) {
    return {
      accessToken: tokenRow.accessToken,
      realmId: tokenRow.realmId,
      apiBaseUrl,
      environment: tokenRow.environment,
    };
  }

  if (!clientId || !clientSecret) return null;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(INTUIT_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenRow.refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    return null;
  }

  const refreshed = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
  };

  const now = Date.now();
  const accessExpiresAt = new Date(
    now + (refreshed.expires_in || 3600) * 1000
  ).toISOString();
  const refreshExpiresAt = new Date(
    now + (refreshed.x_refresh_token_expires_in || 8726400) * 1000
  ).toISOString();

  await db
    .update(quickbooksTokens)
    .set({
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      accessTokenExpiresAt: accessExpiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
      updatedAt: new Date(now).toISOString(),
    })
    .where(eq(quickbooksTokens.id, tokenRow.id));

  return {
    accessToken: refreshed.access_token,
    realmId: tokenRow.realmId,
    apiBaseUrl,
    environment: tokenRow.environment,
  };
}

/**
 * Syncs a CRM Quote (and its Client + Line Items) to QuickBooks Online as an Estimate,
 * and as an Invoice if the quote has been accepted.
 */
export async function syncQuoteToQuickbooks(quoteId: string): Promise<{
  success: boolean;
  estimateId?: string;
  invoiceId?: string;
  error?: string;
}> {
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!quote) {
    return { success: false, error: "Quote not found." };
  }

  const session = await getValidQuickbooksSession();
  if (!session) {
    const errMsg =
      "QuickBooks Online is not connected yet. Connect your QuickBooks account in Rate Card & Settings.";
    await db
      .update(quotes)
      .set({
        quickbooksSyncStatus: "error",
        quickbooksSyncError: errMsg,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quotes.id, quote.id));
    return { success: false, error: errMsg };
  }

  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, quote.clientId))
      .limit(1);
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, quote.projectId))
      .limit(1);
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quote.id));
    const allServices = await db.select().from(services);

    if (!client || !project) {
      throw new Error("Client or Project missing for quote.");
    }

    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // 1. Ensure Customer exists in QuickBooks Online
    let qbCustomerId = client.quickbooksCustomerId;
    if (!qbCustomerId) {
      const displayName = `${client.firstName} ${client.surname} (${client.email})`.slice(
        0,
        100
      );
      const custRes = await fetch(
        `${session.apiBaseUrl}/v3/company/${session.realmId}/customer?minorversion=70`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            DisplayName: displayName,
            GivenName: client.firstName,
            FamilyName: client.surname,
            PrimaryEmailAddr: { Address: client.email },
            PrimaryPhone: { FreeFormNumber: client.whatsapp },
          }),
        }
      );

      if (custRes.ok) {
        const custJson = (await custRes.json()) as {
          Customer?: { Id?: string };
        };
        qbCustomerId = custJson.Customer?.Id || null;
        if (qbCustomerId) {
          await db
            .update(clients)
            .set({ quickbooksCustomerId: qbCustomerId })
            .where(eq(clients.id, client.id));
        }
      } else {
        throw new Error(
          `QuickBooks Customer creation failed: ${await custRes.text()}`
        );
      }
    }

    if (!qbCustomerId) {
      throw new Error("Could not resolve QuickBooks Customer ID.");
    }

    // 2. Build QuickBooks Line Items from CRM quote_items
    const qbLines = items.map((item) => {
      const svc = allServices.find((s) => s.id === item.serviceId);
      const qbItemId = svc?.quickbooksItemId || "1";
      const unitAmountRands = Number((item.lineTotalCents / 100 / Math.max(1, item.quantity)).toFixed(2));
      const lineAmountRands = Number((item.lineTotalCents / 100).toFixed(2));

      return {
        DetailType: "SalesItemLineDetail",
        Amount: lineAmountRands,
        Description: `${item.serviceName} (${quote.deliverySpeed.toUpperCase()}) — ${project.researchTitle}`,
        SalesItemLineDetail: {
          ItemRef: { value: qbItemId },
          Qty: item.quantity,
          UnitPrice: unitAmountRands,
        },
      };
    });

    // 3. Create QuickBooks Estimate (Quote)
    let estimateId = quote.quickbooksEstimateId || undefined;
    if (!estimateId) {
      const estRes = await fetch(
        `${session.apiBaseUrl}/v3/company/${session.realmId}/estimate?minorversion=70`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            CustomerRef: { value: qbCustomerId },
            DocNumber: quote.quoteNumber,
            ExpirationDate: quote.validUntil || undefined,
            CustomerMemo: {
              value: `Research Title: ${project.researchTitle}${
                quote.poNumber ? ` | PO: ${quote.poNumber}` : ""
              }`,
            },
            Line: qbLines,
          }),
        }
      );

      if (!estRes.ok) {
        throw new Error(
          `QuickBooks Estimate sync failed: ${await estRes.text()}`
        );
      }

      const estJson = (await estRes.json()) as {
        Estimate?: { Id?: string };
      };
      estimateId = estJson.Estimate?.Id;
    }

    // 4. Create QuickBooks Invoice if quote is accepted
    let invoiceId = quote.quickbooksInvoiceId || undefined;
    if (quote.outcome === "accepted" && !invoiceId) {
      const invRes = await fetch(
        `${session.apiBaseUrl}/v3/company/${session.realmId}/invoice?minorversion=70`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            CustomerRef: { value: qbCustomerId },
            DocNumber: quote.quoteNumber,
            DueDate: quote.invoiceDueDate || quote.validUntil || undefined,
            CustomerMemo: {
              value: `Quote ${quote.quoteNumber} | ${project.researchTitle}${
                quote.poNumber ? ` | Official PO: ${quote.poNumber}` : ""
              }`,
            },
            Line: qbLines,
          }),
        }
      );

      if (invRes.ok) {
        const invJson = (await invRes.json()) as {
          Invoice?: { Id?: string };
        };
        invoiceId = invJson.Invoice?.Id;
      }
    }

    const nowIso = new Date().toISOString();
    await db
      .update(quotes)
      .set({
        quickbooksEstimateId: estimateId || null,
        quickbooksInvoiceId: invoiceId || null,
        quickbooksSyncStatus: "synced",
        quickbooksSyncError: null,
        quickbooksLastSyncedAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(quotes.id, quote.id));

    return {
      success: true,
      estimateId,
      invoiceId,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "QuickBooks sync error.";
    await db
      .update(quotes)
      .set({
        quickbooksSyncStatus: "error",
        quickbooksSyncError: message,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quotes.id, quote.id));
    return { success: false, error: message };
  }
}

