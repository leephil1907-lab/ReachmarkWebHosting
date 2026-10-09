import { GitHubIntegration } from "@/components/github-integration";

export default async function SettingsPage({searchParams}:{searchParams:Promise<{github?:string}>}) {
 const params=await searchParams;
 return <div className="space-y-8"><header><p className="text-xs uppercase tracking-[.22em] text-violet-300">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Settings</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Manage account integrations and the configuration needed to ship applications.</p></header><GitHubIntegration status={params.github||""}/><section className="rounded-2xl border border-white/10 bg-[#0d1016] p-6"><h2 className="font-medium">Deployment runtime</h2><p className="mt-2 text-sm text-slate-400">The control plane can store projects, service configuration and queued deployment records. No isolated build worker or container runtime is connected yet.</p><div className="mt-4 inline-flex rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-300">Not configured</div></section></div>;
}
