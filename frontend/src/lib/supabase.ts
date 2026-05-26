/**
 * src/lib/supabase.ts
 * Supabase Storage client (server-side)
 * Graceful fallback jika credentials belum dikonfigurasi
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isConfigured =
  SUPABASE_URL &&
  SUPABASE_URL !== "https://your-project.supabase.co" &&
  SUPABASE_SERVICE_ROLE_KEY &&
  SUPABASE_SERVICE_ROLE_KEY !== "your-service-role-key";

// ─── Bucket Configuration ─────────────────────────────────────────────────────

export const BUCKET_CONFIG = {
  avatars: {
    bucket: "avatars",
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    expirySeconds: 3600,
  },
  deliverables: {
    bucket: "deliverables",
    maxSizeBytes: 100 * 1024 * 1024, // 100 MB
    allowedMimeTypes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "video/mp4",
      "video/quicktime",
    ],
    expirySeconds: 3600,
  },
  invoices: {
    bucket: "invoices",
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    expirySeconds: 3600,
  },
  "project-files": {
    bucket: "project-files",
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
    allowedMimeTypes: [
      "application/pdf",
      "application/zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/svg+xml",
    ],
    expirySeconds: 3600,
  },
} as const;

export type BucketName = keyof typeof BUCKET_CONFIG;

// ─── Supabase Storage REST API helpers ───────────────────────────────────────

function supabaseHeaders() {
  return {
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

/**
 * Generate a signed upload URL
 * Returns: { signedUrl, token, path }
 */
export async function createSignedUploadUrl(
  bucket: BucketName,
  filePath: string
): Promise<{ signedUrl: string; token: string; path: string } | null> {
  if (!isConfigured) {
    console.warn("[Supabase] Not configured — storage features disabled");
    return null;
  }

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${filePath}`,
    {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({ expiresIn: 300 }), // 5 menit untuk upload
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[Supabase] createSignedUploadUrl error:", err);
    return null;
  }

  const data = await res.json();
  return {
    signedUrl: `${SUPABASE_URL}/storage/v1${data.url}`,
    token: data.token,
    path: filePath,
  };
}

/**
 * Generate a signed download URL (1 jam expiry by default)
 */
export async function createSignedDownloadUrl(
  bucket: BucketName,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!isConfigured) {
    console.warn("[Supabase] Not configured — storage features disabled");
    return null;
  }

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${filePath}`,
    {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({ expiresIn }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[Supabase] createSignedDownloadUrl error:", err);
    return null;
  }

  const data = await res.json();
  return `${SUPABASE_URL}/storage/v1${data.signedURL}`;
}

/**
 * Delete a file from storage
 */
export async function deleteStorageFile(bucket: BucketName, filePath: string): Promise<boolean> {
  if (!isConfigured) return false;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
    { method: "DELETE", headers: supabaseHeaders() }
  );

  return res.ok;
}

export { isConfigured as supabaseConfigured };
