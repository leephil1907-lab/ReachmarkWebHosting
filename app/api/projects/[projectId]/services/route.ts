import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ projectId: string }> };

export async function POST(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspace: { memberships: { some: { userId: user.id } } } },
    include: { environments: { where: { kind: "PRODUCTION" }, take: 1 } },
  });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const allowed = ["APPLICATION", "DATABASE", "WORKER", "CRON", "STATIC"] as const;
  const type = allowed.find((item) => item === body.type);
  const environment = project.environments[0];
  if (!environment || name.length < 2 || name.length > 60 || !type) {
    return NextResponse.json({ error: "Provide a valid service name and type." }, { status: 400 });
  }
  try {
    const service = await prisma.service.create({
      data: {
        name, type, projectId, environmentId: environment.id,
        repository: typeof body.repository === "string" ? body.repository.trim().slice(0, 500) || null : null,
        branch: typeof body.branch === "string" ? body.branch.trim().slice(0, 120) || null : null,
        rootDirectory: typeof body.rootDirectory === "string" ? body.rootDirectory.trim().slice(0, 200) || null : null,
        buildCommand: typeof body.buildCommand === "string" ? body.buildCommand.trim().slice(0, 300) || null : null,
        startCommand: typeof body.startCommand === "string" ? body.startCommand.trim().slice(0, 300) || null : null,
        port: Number.isInteger(body.port) && body.port >= 1 && body.port <= 65535 ? body.port : null,
      },
    });
    return NextResponse.json({ service, deploymentRuntime: "not_configured" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A service with that name may already exist in this environment." }, { status: 409 });
  }
}
