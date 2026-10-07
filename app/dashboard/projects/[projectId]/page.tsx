"use client";

import { useState } from "react";
import Link from "next/link";

const services = [
  { name: "web", type: "Application", status: "Not deployed", region: "Lagos", runtime: "Awaiting source" },
  { name: "api", type: "Application", status: "Not deployed", region: "Lagos", runtime: "Awaiting source" },
  { name: "postgres", type: "Database", status: "Not provisioned", region: "Lagos", runtime: "PostgreSQL" },
];

const tabs = ["Overview", "Services", "Deployments", "Variables", "Domains", "Metrics", "Activity"];

export default async function ProjectWorkspace({ params }: { params: Promise<{ projectId: string }> }) {\n  const { projectId } = await params;
  const [tab, setTab] = useState("Overview");
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div><Link href="/dashboard/projects" className="text-xs text-slate-500 hover:text-white">Projects</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold">{projectId}</h1><span className="rounded-full border border-amber-300/20 bg-amber-300/[.04] px-3 py-1 text-xs text-amber-300">Setup required</span></div><p className="mt-2 text-sm text-slate-400">Production workspace • Lagos region</p></div>
        <div className="flex gap-2"><select className="h-10 rounded-xl border border-white/10 bg-[#0d1016] px-3 text-sm text-slate-300"><option>Production</option><option>Preview</option></select><button disabled className="h-10 rounded-xl bg-white/10 px-4 text-sm text-slate-500">Deploy</button></div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px">{tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm ${tab===t?"border-violet-400 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>{t}</button>)}</nav>

      {tab === "Overview" && <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Services","0 running"],["Deployments","No deployments"],["Requests","Awaiting data"],["Spend","Awaiting billing"]].map(([a,b])=><article key={a} className="rounded-2xl border border-white/10 bg-[#0d1016] p-5"><p className="text-xs uppercase tracking-wider text-slate-500">{a}</p><p className="mt-3 text-xl font-medium">{b}</p></article>)}</section>
        <section className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0d1016] p-6"><div className="flex items-center justify-between"><div><h2 className="font-medium">Service topology</h2><p className="mt-1 text-xs text-slate-500">Architecture becomes live as services are created.</p></div><span className="font-mono text-xs text-slate-600">RWH / GRAPH</span></div><div className="relative mt-8 min-h-[260px] overflow-hidden rounded-xl border border-white/5 bg-[#080a0f] p-5"><div className="absolute left-1/2 top-1/2 h-px w-[55%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"/><div className="grid grid-cols-3 items-center gap-3"><Node label="WEB" tone="violet"/><Node label="API" tone="cyan"/><Node label="POSTGRES" tone="emerald"/></div><p className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-600">No live service graph yet — connect a repository to begin.</p></div></div>
          <div className="rounded-2xl border border-white/10 bg-[#0d1016] p-6"><h2 className="font-medium">Next action</h2><div className="mt-6 space-y-3"><Action n="01" t="Connect GitHub" d="Authorize repository access."/><Action n="02" t="Choose a repository" d="Select source and branch."/><Action n="03" t="Deploy first service" d="Build and release your app."/></div></div>
        </section>
      </div>}

      {tab === "Services" && <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1016]"><div className="border-b border-white/10 p-5"><h2 className="font-medium">Services</h2><p className="mt-1 text-xs text-slate-500">Applications, workers and databases in this environment.</p></div><div className="divide-y divide-white/5">{services.map(s=><div key={s.name} className="grid gap-3 p-5 sm:grid-cols-[1fr_140px_100px_1fr] sm:items-center"><div><p className="font-medium">{s.name}</p><p className="text-xs text-slate-500">{s.type}</p></div><span className="text-xs text-slate-500">{s.status}</span><span className="text-xs text-slate-500">{s.region}</span><span className="text-xs text-slate-600">{s.runtime}</span></div>)}</div></section>}

      {tab !== "Overview" && tab !== "Services" && <section className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-10 text-center"><p className="font-medium">{tab}</p><p className="mt-2 text-sm text-slate-500">This control surface is intentionally waiting for the backend capability. No fake data is shown.</p></section>}
    </div>
  );
}

function Node({ label, tone }: { label: string; tone: string }) { const tones: Record<string,string>={violet:"border-violet-400/30 bg-violet-400/10",cyan:"border-cyan-400/30 bg-cyan-400/10",emerald:"border-emerald-400/30 bg-emerald-400/10"}; return <div className={`relative z-10 rounded-xl border p-4 text-center text-xs font-medium ${tones[tone]}`}>{label}<div className="mt-2 text-[10px] text-slate-500">offline</div></div> }
function Action({ n,t,d }: { n:string;t:string;d:string }) { return <div className="rounded-xl border border-white/5 bg-black/10 p-4"><div className="font-mono text-[10px] text-violet-300">{n}</div><p className="mt-2 text-sm">{t}</p><p className="mt-1 text-xs text-slate-500">{d}</p></div> }
