import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";
import {
  BUCKET_CONFIG,
  BucketName,
  createSignedUploadUrl,
  supabaseConfigured,
} from "@/lib/supabase";
import { randomUUID } from "crypto";

/**
 * POST /api/storage/upload-url
 * Auth required — generate signed upload URL untuk Supabase Storage
 * Body: { bucket: "avatars"|"deliverables"|"invoices"|"project-files", fileName: string, mimeType: string, sizeBytes: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    if (!supabaseConfigured) {
      return err("Storage belum dikonfigurasi. Hubungi administrator.", 503);
    }

    const body = await request.json();
    const { bucket, fileName, mimeType, sizeBytes } = body as {
      bucket: BucketName;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
    };

    // Validasi bucket
    if (!bucket || !BUCKET_CONFIG[bucket]) {
      return err(`Bucket tidak valid. Pilih salah satu: ${Object.keys(BUCKET_CONFIG).join(", ")}`, 422);
    }

    const config = BUCKET_CONFIG[bucket];

    // Validasi file size
    if (sizeBytes > config.maxSizeBytes) {
      const maxMB = config.maxSizeBytes / (1024 * 1024);
      return err(`Ukuran file maksimal ${maxMB}MB untuk bucket ${bucket}`, 422);
    }

    // Validasi MIME type
    if (!config.allowedMimeTypes.includes(mimeType as any)) {
      return err(
        `Tipe file tidak diizinkan. Tipe yang diperbolehkan: ${config.allowedMimeTypes.join(", ")}`,
        422
      );
    }

    // Buat path unik: userId/uuid-filename
    const userId = session!.user.id;
    const ext = fileName.split(".").pop() || "";
    const uniqueName = `${randomUUID()}.${ext}`;
    const filePath = `${userId}/${uniqueName}`;

    const result = await createSignedUploadUrl(bucket, filePath);
    if (!result) {
      return err("Gagal membuat upload URL. Coba lagi.", 500);
    }

    return ok({
      signedUrl: result.signedUrl,
      token: result.token,
      path: filePath,
      bucket,
      publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("[POST /api/storage/upload-url]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
