"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Sign in failed."); return; }
      router.replace("/dashboard"); router.refresh();
    } catch { setError("Network error. Please try again."); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#050609] px-6 py-12 text-white"><div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center"><div className="w-full rounded-3xl border border-white/10 bg-[#0b0e14] p-7 shadow-2xl"><a href="/" className="text-sm font-semibold">R<span className="text-violet-300">/</span> Reachmark</a><h1 className="mt-12 text-3xl tracking-[-.04em]">Welcome back.</h1><p className="mt-3 text-sm text-slate-500">Sign in to manage your projects and deployments.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm text-slate-300">Email<input name="email" type="email" autoComplete="email" required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-300/50"/></label><label className="block text-sm text-slate-300">Password<input name="password" type="password" autoComplete="current-password" required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-300/50"/></label>{error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">{error}</p>}<button disabled={busy} className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button></form><p className="mt-6 text-center text-sm text-slate-500">New to Reachmark? <a href="/signup" className="text-violet-300">Create an account</a></p></div></div></main>;
}
