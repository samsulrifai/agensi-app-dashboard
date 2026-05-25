"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Login successful");
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const autofill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
      <form onSubmit={handleLogin}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-emerald-400">Welcome back</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500" 
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Link href="#" className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:ring-emerald-500"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="text-xs text-slate-400 text-center flex flex-col gap-2 mt-2">
            <span className="font-semibold text-slate-300">Demo Accounts:</span>
            <div className="flex gap-2 justify-center">
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700" onClick={() => autofill('admin@demo.com', 'demo1234')}>Admin</Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700" onClick={() => autofill('andi@demo.com', 'demo1234')}>Worker</Button>
            </div>
          </div>

          <div className="text-center text-sm text-slate-400 mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
