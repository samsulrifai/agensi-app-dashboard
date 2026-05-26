import { NextRequest } from "next/server";
import { getAuthSession, ok, err } from "@/lib/api-helpers";
import { BucketName, BUCKET_CONFIG, createSignedDownloadUrl, supabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/storage/download-url?bucket=xxx&path=xxx&expiry=3600
 * Auth required — generate signed download URL (expiry 1 jam default)
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await getAuthSession();
    if (error) return error;

    if (!supabaseConfigured) {
      return err("Storage belum dikonfigurasi.", 503);
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket") as BucketName | null;
    const filePath = searchParams.get("path");
    const expiry = parseInt(searchParams.get("expiry") || "3600");

    if (!bucket || !BUCKET_CONFIG[bucket]) {
      return err("Bucket tidak valid", 422);
    }

    if (!filePath) {
      return err("Path file diperlukan", 422);
    }

    const signedUrl = await createSignedDownloadUrl(bucket, filePath, expiry);
    if (!signedUrl) {
      return err("Gagal membuat download URL", 500);
    }

    return ok({
      signedUrl,
      expiresInSeconds: expiry,
    });
  } catch (error) {
    console.error("[GET /api/storage/download-url]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
