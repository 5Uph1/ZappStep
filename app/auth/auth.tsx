"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // ── LOGIN ──────────────────────────────────────────────
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // refresh() dulu agar middleware membaca cookie session yang baru,
        // baru kemudian push ke dashboard
        router.refresh();
        router.push("/dashboard");
      } else {
        // ── REGISTER ───────────────────────────────────────────
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        setSuccessMsg(
          "Registrasi berhasil! Cek email kamu untuk konfirmasi, lalu login.",
        );
        setEmail("");
        setPassword("");
        setIsLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <svg
              className="text-emerald-600 w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 6H17.82C17.4 4.84 16.3 4 15 4H9C7.7 4 6.6 4.84 6.18 6H5C3.9 6 3 6.9 3 8V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V8C21 6.9 20.1 6 19 6ZM9 6H15C15.55 6 16 6.45 16 7H8C8 6.45 8.45 6 9 6ZM12 17L7 12H10V10H14V12H17L12 17Z" />
            </svg>
            <h1 className="text-2xl font-black tracking-tight text-emerald-600">
              QuickShop
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Solutions", "Pricing", "About"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-slate-500 hover:text-emerald-500 transition-colors text-sm font-medium"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center p-6 z-10">
        <div
          className="w-full max-w-[440px] border border-white/50 rounded-2xl p-10 flex flex-col gap-6"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-[30px] font-semibold leading-[1.3] tracking-[-0.01em] text-slate-900">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-base text-slate-500">
              {isLogin
                ? "Sign in to manage your storefront"
                : "Create an account to get started"}
            </p>
          </div>

          {/* Error / Success banner */}
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-800 block px-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
                placeholder="admin@quickshop.io"
                className="w-full h-[48px] px-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all outline-none text-base disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-800"
                >
                  Password
                </label>
                {isLogin && (
                  <Link
                    href="#"
                    className="text-emerald-700 text-xs font-semibold hover:underline"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full h-[48px] px-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all outline-none text-base disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-inner hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Login"
                  : "Register"}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-base text-slate-800">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleForm}
                disabled={loading}
                className="text-emerald-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            © 2023 QuickShop Inc. Built for speed.
          </p>
          <div className="flex gap-6">
            {["Shop", "About", "Support", "Privacy"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-slate-500 hover:text-emerald-500 transition-colors text-xs font-semibold uppercase tracking-widest"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
