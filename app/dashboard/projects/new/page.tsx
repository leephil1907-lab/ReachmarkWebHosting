import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header><Link href="/dashboard/projects" className="text-xs text-slate-500 hover:text-white">← Projects</Link><p className="mt-6 text-xs uppercase tracking-[.22em] text-violet-300">New project</p><h1 className="mt-2 text-3xl font-semibold">Create a deployment workspace</h1><p className="mt-2 text-sm text-slate-400">Start with the identity of your product. GitHub connection and deployment configuration come next.</p></header>
      <form className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1016] p-6" onSubmit={(e)=>e.preventDefault()}>
        <label className="block"><span className="text-sm text-slate-300">Project name</span><input name="name" placeholder="my-product" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-violet-400/60" /></label>
        <label className="block"><span className="text-sm text-slate-300">Description <span className="text-slate-600">(optional)</span></span><textarea name="description" placeholder="What are you deploying?" rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60" /></label>
        <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/[.03] p-4 text-sm text-slate-400"><span className="text-cyan-300">Next:</span> connect GitHub, choose a repository and branch, then configure the first service.</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/dashboard/projects" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm">Cancel</Link><button type="button" disabled className="h-11 cursor-not-allowed rounded-xl bg-white/10 px-5 text-sm font-semibold text-slate-500">Create project — backend pending</button></div>
      </form>
    </div>
  );
}
