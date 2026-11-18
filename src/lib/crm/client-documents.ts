export interface ClientSourceDocument {
  name: string;
  url: string | null;
  uploadedAt?: string;
}

/**
 * Parses `projects.uploadedFileName` and `projects.uploadedFileUrl` into a list
 * of uploaded client source documents. Supports both the JSON-array format used
 * for multi-document uploads and legacy single-file string values.
 */
export function parseClientSourceDocuments(
  uploadedFileName?: string | null,
  uploadedFileUrl?: string | null
): ClientSourceDocument[] {
  const trimmedUrl = uploadedFileUrl?.trim() || "";
  const trimmedName = uploadedFileName?.trim() || "";

  if (trimmedUrl.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmedUrl);
      if (Array.isArray(parsed)) {
        const docs: ClientSourceDocument[] = [];
        for (const item of parsed) {
          if (item && typeof item === "object") {
            const rawName = (item as { name?: unknown }).name;
            const rawUrl = (item as { url?: unknown }).url;
            const rawUploadedAt = (item as { uploadedAt?: unknown }).uploadedAt;
            const name =
              typeof rawName === "string" && rawName.trim()
                ? rawName.trim()
                : "Client Document";
            const url =
              typeof rawUrl === "string" && rawUrl.trim()
                ? rawUrl.trim()
                : null;
            docs.push({
              name,
              url,
              uploadedAt:
                typeof rawUploadedAt === "string" ? rawUploadedAt : undefined,
            });
          }
        }
        if (docs.length > 0) {
          return docs;
        }
      }
    } catch {
      // Fall through to legacy single-file parsing
    }
  }

  if (trimmedUrl) {
    return [
      {
        name: trimmedName || "Client Document",
        url: trimmedUrl,
      },
    ];
  }

  if (trimmedName) {
    return [
      {
        name: trimmedName,
        url: null,
      },
    ];
  }

  return [];
}

/**
 * Serializes a list of client source documents back into the existing
 * `projects.uploadedFileName` and `projects.uploadedFileUrl` columns.
 */
export function serializeClientSourceDocuments(docs: ClientSourceDocument[]): {
  uploadedFileName: string | null;
  uploadedFileUrl: string | null;
} {
  if (docs.length === 0) {
    return {
      uploadedFileName: null,
      uploadedFileUrl: null,
    };
  }

  return {
    uploadedFileName: docs.map((d) => d.name).join(", "),
    uploadedFileUrl: JSON.stringify(docs),
  };
}
