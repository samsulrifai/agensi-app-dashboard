"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim link reset password");
      }

      setStatus("success");
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Lupa Password</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email Anda untuk menerima link reset password.
        </p>
      </div>

      {status === "success" ? (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
          <Mail className="mx-auto h-6 w-6 mb-2" />
          <p>Jika email terdaftar, kami telah mengirimkan link untuk mereset password Anda. Silakan cek inbox Anda.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-1 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                />
              </div>
              
              {status === "error" && (
                <div className="text-sm text-red-500 font-medium">
                  {errorMessage}
                </div>
              )}

              <Button disabled={status === "loading"} className="bg-emerald-600 hover:bg-emerald-700">
                {status === "loading" ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-emerald-600 flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Login
        </Link>
      </p>
    </div>
  );
}
