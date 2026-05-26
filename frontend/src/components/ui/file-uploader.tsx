"use client";

import React, { useState, useCallback, useRef } from "react";
import { UploadCloud, File, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  bucket?: string;
  maxSizeMB?: number;
  acceptedTypes?: string; // e.g. "image/*,application/pdf"
  onUploadComplete: (url: string) => void;
  className?: string;
}

export function FileUploader({
  bucket = "attachments",
  maxSizeMB = 5,
  acceptedTypes = "*",
  onUploadComplete,
  className
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Ukuran file maksimal ${maxSizeMB}MB`);
      setStatus("error");
      return;
    }

    setFile(selectedFile);
    setErrorMsg("");
    setStatus("idle");
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [maxSizeMB]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const uploadFile = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(10);
    setErrorMsg("");

    try {
      // 1. Get Presigned URL
      const res = await fetch("/api/storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          bucket,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mendapatkan upload URL");
      }

      const { uploadUrl, publicUrl } = await res.json();
      setProgress(40);

      // 2. Upload to Supabase/S3 using presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah file");
      }

      setProgress(100);
      setStatus("success");
      onUploadComplete(publicUrl);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Terjadi kesalahan saat upload");
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">Klik atau seret file ke sini</p>
          <p className="text-xs text-muted-foreground mt-1">
            Max ukuran: {maxSizeMB}MB
          </p>
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept={acceptedTypes}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
                <File className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {status !== "uploading" && status !== "success" && (
              <button onClick={removeFile} className="text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
            {status === "success" && (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            )}
          </div>

          {status === "uploading" && (
            <div className="space-y-1 mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mengunggah...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {status === "error" && (
            <p className="text-xs text-red-500 mt-2 font-medium">{errorMsg}</p>
          )}

          {status === "idle" && (
            <button
              type="button"
              onClick={uploadFile}
              className="mt-3 w-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md py-1.5 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Upload File
            </button>
          )}
        </div>
      )}
    </div>
  );
}
