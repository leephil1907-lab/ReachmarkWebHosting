"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router=useRouter(); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setBusy(true);const form=new FormData(e.currentTarget);
    try{const response=await fetch("/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.get("name"),description:form.get("description")})});const data=await response.json();if(!response.ok){setError(data.error||"Could not create project.");return;}router.push(`/dashboard/projects/${data.project.id}`);router.refresh();}
    catch{setError("Network error. Please try again.");}finally{setBusy(false);}
  }
  return <div className="mx-auto max-w-3xl space-y-8"><header><Link href="/dashboard/projects" className="text-xs text-slate-500 hover:text-white">← Projects</Link><p className="mt-6 text-xs uppercase tracking-[.22em] text-violet-300">New project</p><h1 className="mt-2 text-3xl font-semibold">Create a deployment workspace</h1><p className="mt-2 text-sm text-slate-400">Create a project and its production and preview environments.</p></header><form onSubmit={submit} className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1016] p-6"><label className="block"><span className="text-sm text-slate-300">Project name</span><input name="name" required minLength={2} maxLength={80} placeholder="my-product" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-violet-400/60"/></label><label className="block"><span className="text-sm text-slate-300">Description <span className="text-slate-600">(optional)</span></span><textarea name="description" maxLength={500} placeholder="What are you building?" rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"/></label>{error&&<p role="alert" className="text-sm text-red-300">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/dashboard/projects" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm">Cancel</Link><button disabled={busy} className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black disabled:opacity-60">{busy?"Creating project…":"Create project"}</button></div></form></div>;
}
