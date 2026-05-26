"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Terjadi kesalahan");
      } else {
        setSent(true);
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
            <Mail className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Lupa Password?</h1>
          <p className="text-slate-400 mt-1 text-sm">Tidak masalah, kami akan kirimkan link reset.</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Reset Password</CardTitle>
            <CardDescription className="text-slate-400">
              Masukkan email yang terdaftar di akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Email terkirim!</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Jika <strong className="text-slate-200">{email}</strong> terdaftar, Anda akan menerima link reset password dalam beberapa menit.
                  </p>
                </div>
                <p className="text-slate-500 text-xs">Link kadaluarsa dalam 1 jam.</p>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 mt-2"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  Kirim ulang
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
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
                  {isLoading ? "Mengirim..." : "Kirim Link Reset"}
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
