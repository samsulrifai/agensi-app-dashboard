"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Token reset password tidak valid atau tidak ditemukan.");
      setStatus("error");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Password tidak cocok");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mereset password");
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan password baru untuk akun Anda.
        </p>
      </div>

      {status === "success" ? (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
          <Lock className="mx-auto h-6 w-6 mb-2" />
          <p>Password berhasil direset. Mengalihkan ke halaman login...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-1 space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === "loading" || !token}
                />
              </div>

              <div className="grid gap-1 space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={status === "loading" || !token}
                />
              </div>
              
              {status === "error" && (
                <div className="text-sm text-red-500 font-medium">
                  {errorMessage}
                </div>
              )}

              <Button disabled={status === "loading" || !token} className="bg-emerald-600 hover:bg-emerald-700">
                {status === "loading" ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
