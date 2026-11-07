import crypto from "crypto";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() || "";
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || "";
  const publicUrl = process.env.R2_PUBLIC_URL?.trim() || undefined;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getSignatureKey(
  secretAccessKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Buffer {
  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, regionName);
  const kService = hmacSha256(kRegion, serviceName);
  return hmacSha256(kService, "aws4_request");
}

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function encodeS3Key(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeRfc3986(segment))
    .join("/");
}

export function sanitizeR2FileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

/**
 * Uploads a Buffer directly to Cloudflare R2 using AWS Signature V4 (S3-compatible PUT).
 */
export async function uploadBufferToR2(input: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ key: string }> {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Cloudflare R2 is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."
    );
  }

  const region = "auto";
  const service = "s3";
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const cleanKey = input.key.replace(/^\/+/, "");
  const canonicalUri = `/${encodeRfc3986(config.bucketName)}/${encodeS3Key(cleanKey)}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = sha256Hex(input.buffer);
  const contentType = input.contentType || "application/octet-stream";

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(
    config.secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorizationHeader,
    },
    body: new Uint8Array(input.buffer),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudflare R2 upload failed (${response.status}): ${errText}`);
  }

  return { key: cleanKey };
}

/**
 * Generates a temporary AWS Signature V4 presigned GET URL for a private Cloudflare R2 object.
 */
export function getR2PresignedDownloadUrl(input: {
  key: string;
  expiresInSeconds?: number;
  downloadFileName?: string;
}): string {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  const region = "auto";
  const service = "s3";
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const cleanKey = input.key.replace(/^\/+/, "");
  const canonicalUri = `/${encodeRfc3986(config.bucketName)}/${encodeS3Key(cleanKey)}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const expires = Math.min(604800, Math.max(60, input.expiresInSeconds || 3600));

  const queryParams: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };

  if (input.downloadFileName) {
    const safeName = sanitizeR2FileName(input.downloadFileName);
    queryParams["response-content-disposition"] =
      `attachment; filename="${safeName}"`;
  }

  const sortedQueryKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedQueryKeys
    .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(queryParams[k])}`)
    .join("&");

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(
    config.secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

