import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DomainsPage(){
 const user=await getCurrentUser();const workspaceId=user?.memberships[0]?.workspaceId;
 const domains=workspaceId?await prisma.domain.findMany({where:{service:{project:{workspaceId}}},include:{service:{include:{project:true}}},orderBy:{createdAt:"desc"}}):[];
 return <div className="space-y-8"><header><p className="text-xs uppercase tracking-[.22em] text-violet-300">Networking</p><h1 className="mt-2 text-3xl font-semibold">Domains</h1><p className="mt-2 text-sm text-slate-400">Domain records attached to your services. DNS checks and certificate provisioning require an ingress controller.</p></header>{domains.length===0?<div className="rounded-2xl border border-dashed border-white/10 p-10 text-center"><p className="text-sm text-slate-300">No domain records</p><p className="mt-2 text-xs text-slate-500">Attach a hostname from a project’s Domains tab.</p><Link href="/dashboard/projects" className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">View projects</Link></div>:<section className="space-y-3">{domains.map(d=><article key={d.id} className="rounded-2xl border border-white/10 bg-[#0d1016] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{d.hostname}</p><p className="mt-1 text-xs text-slate-500"><Link href={`/dashboard/projects/${d.service.projectId}`} className="hover:text-violet-300">{d.service.project.name} / {d.service.name}</Link></p></div><span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-300">DNS / TLS pending</span></div></article>)}</section>}</div>;
}
