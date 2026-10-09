import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const user=await getCurrentUser();
  const workspaceId=user?.memberships[0]?.workspaceId;
  const projects=workspaceId?await prisma.project.findMany({where:{workspaceId},include:{services:true},orderBy:{updatedAt:"desc"}}):[];
  return <div className="space-y-8"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[.22em] text-violet-300">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Projects</h1><p className="mt-2 text-sm text-slate-400">Manage your services, environments and deployments.</p></div><Link href="/dashboard/projects/new" className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black">New project</Link></header>
  {projects.length===0?<div className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-10 text-center"><p className="text-lg font-medium">Your first project starts here.</p><p className="mt-2 text-sm text-slate-500">Create a project to begin configuring services.</p><Link href="/dashboard/projects/new" className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">Create project</Link></div>:<section className="grid gap-3">{projects.map(project=><Link key={project.id} href={`/dashboard/projects/${project.id}`} className="rounded-2xl border border-white/10 bg-[#0d1016] p-6 transition hover:border-violet-400/30"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-medium">{project.name}</h2><p className="mt-2 text-sm text-slate-500">{project.description||"No description"} · Updated {project.updatedAt.toLocaleDateString()}</p></div><div className="flex items-center gap-3"><span className="text-xs text-slate-400">{project.services.length} services</span><span className="text-violet-300">→</span></div></div></Link>)}</section>}</div>;
}
