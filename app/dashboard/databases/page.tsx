import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DatabasesPage(){
 const user=await getCurrentUser();const workspaceId=user?.memberships[0]?.workspaceId;
 const databases=workspaceId?await prisma.service.findMany({where:{type:"DATABASE",project:{workspaceId}},include:{project:true,environment:true},orderBy:{createdAt:"desc"}}):[];
 return <div className="space-y-8"><header><p className="text-xs uppercase tracking-[.22em] text-violet-300">Data</p><h1 className="mt-2 text-3xl font-semibold">Databases</h1><p className="mt-2 text-sm text-slate-400">Database service declarations in your projects. These records do not provision database servers yet.</p></header>{databases.length===0?<div className="rounded-2xl border border-dashed border-white/10 p-10 text-center"><p className="text-sm text-slate-300">No database services configured</p><p className="mt-2 text-xs text-slate-500">Add a database service from a project workspace.</p><Link href="/dashboard/projects" className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">View projects</Link></div>:<div className="space-y-3">{databases.map(db=><Link key={db.id} href={`/dashboard/projects/${db.projectId}`} className="block rounded-2xl border border-white/10 bg-[#0d1016] p-5 hover:border-violet-400/30"><p className="font-medium">{db.name}</p><p className="mt-1 text-xs text-slate-500">{db.project.name} · {db.environment.name} · {db.region}</p><p className="mt-3 text-xs text-amber-300">Configuration only · provisioning not connected</p></Link>)}</div>}</div>;
}
