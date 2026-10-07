import Link from "next/link";

const projects = [
  { name: "No projects yet", description: "Your deployed applications will appear here.", status: "Ready" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs uppercase tracking-[.22em] text-violet-300">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Projects</h1><p className="mt-2 text-sm text-slate-400">A project groups the services, environments, domains and deployments for one product.</p></div>
        <Link href="/dashboard/projects/new" className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black">New project</Link>
      </header>
      <section className="grid gap-4">
        {projects.map((project) => (
          <article key={project.name} className="rounded-2xl border border-white/10 bg-[#0d1016] p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-slate-500"/><h2 className="font-medium">{project.name}</h2></div><p className="mt-2 text-sm text-slate-500">{project.description}</p></div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{project.status}</span>
            </div>
          </article>
        ))}
      </section>
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-8 text-center">
        <p className="text-sm text-slate-400">Create your first project to unlock the deployment workspace.</p>
        <Link href="/dashboard/projects/new" className="mt-4 inline-flex text-sm font-medium text-violet-300 hover:text-violet-200">Create project →</Link>
      </div>
    </div>
  );
}
