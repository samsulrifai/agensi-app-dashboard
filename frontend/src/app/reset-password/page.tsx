"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Validasi token saat load
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      return;
    }

    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((json) => {
        setTokenValid(json.success);
        if (!json.success) setError(json.error || "Token tidak valid");
      })
      .catch(() => setError("Gagal memvalidasi token"))
      .finally(() => setIsValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Terjadi kesalahan");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <Lock className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Buat Password Baru</h1>
          <p className="text-slate-400 mt-1 text-sm">Masukkan password baru untuk akun Anda.</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Reset Password</CardTitle>
            <CardDescription className="text-slate-400">
              Password minimal 8 karakter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isValidating ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm mt-3">Memvalidasi link...</p>
              </div>
            ) : success ? (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Password berhasil diubah!</p>
                  <p className="text-slate-400 text-sm mt-1">Mengalihkan ke halaman login...</p>
                </div>
              </div>
            ) : !tokenValid ? (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Link tidak valid</p>
                  <p className="text-slate-400 text-sm mt-1">{error || "Link sudah kadaluarsa atau sudah digunakan."}</p>
                </div>
                <Link href="/forgot-password">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                    Request Link Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-700">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke halaman login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
