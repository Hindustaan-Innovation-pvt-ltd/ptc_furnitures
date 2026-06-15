"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Access Denied.");
        setLoading(false);
      } else {
        // Successful login
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative inner gradient edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      {/* Header / Logo */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-3">
          <Image
            src="/logo-white.svg"
            alt="PTC Furnitures"
            width={160}
            height={56}
            priority
            className="h-10 w-auto mx-auto object-contain"
          />
        </div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">
          Admin Portal Login
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Authorized personnel only. Please sign in to manage workspace.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-xs font-semibold text-slate-300"
          >
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="username"
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="pl-9 bg-slate-950/40 border-white/5 focus-visible:ring-red-500/20 focus-visible:border-red-500/50 text-slate-100 text-sm h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-slate-300"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="pl-9 pr-10 bg-slate-950/40 border-white/5 focus-visible:ring-red-500/20 focus-visible:border-red-500/50 text-slate-100 text-sm h-10 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit button with glow and hover animation */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/20 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
        >
          <span>← Back to main website</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#090b11] overflow-hidden px-4">
      {/* Dynamic blurred background light sources */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-red-950/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl w-full max-w-md h-[400px]">
            <Loader2 className="size-8 animate-spin text-red-500" />
            <p className="text-sm text-slate-400 mt-4">
              Loading secure portal...
            </p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
