"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-react";

const DEMO_EMAIL = "admin@gmail.com";
const DEMO_PASSWORD = "Asdf%1234";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    router.push("/admin/dashboard");
    router.refresh();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush">
              <Heart size={22} strokeWidth={2.5} fill="currentColor" className="text-surface" />
            </span>
            <h1 className="mt-3 font-display text-[22px] font-semibold text-ink">
              Mom<span className="text-blush-deep">&</span>Child
            </h1>
            <p className="mt-1 text-[13.5px] text-ink-soft">Sign in to manage your store</p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">Email address</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@momandchild.com"
                    className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-soft/50"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-[13px] font-medium text-ink">Password</label>
                  <button
                    type="button"
                    className="text-[12.5px] font-semibold text-blush-deep hover:underline"
                    onClick={() => setError("Password reset isn't wired up in this demo yet.")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-10 text-[14px] text-ink placeholder:text-ink-soft/50"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink-soft"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-ink-soft">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border accent-[#d97f7f]"
                />
                Keep me signed in
              </label>

              {error && (
                <p className="rounded-xl bg-rose-danger/10 px-3.5 py-2.5 text-[12.5px] text-rose-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-blush-deep py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90 disabled:opacity-70"
              >
                {loading && <LoaderCircle size={16} className="animate-spin" />}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-5 rounded-xl bg-cream px-3.5 py-3 text-[12.5px] text-ink-soft">
              <p className="font-semibold text-ink">Demo credentials</p>
              <p className="mt-0.5">Email: {DEMO_EMAIL}</p>
              <p>Password: {DEMO_PASSWORD}</p>
            </div>
          </div>

          <p className="mt-6 text-center text-[12.5px] text-ink-soft">
            © {new Date().getFullYear()} MomAndChild. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}