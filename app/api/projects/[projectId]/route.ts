import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspace: { memberships: { some: { userId: user.id } } } },
    include: {
      environments: { include: { services: { include: { domains: true, deployments: { orderBy: { createdAt: "desc" }, take: 10, include: { logs: { orderBy: { timestamp: "asc" }, take: 100 } } } } } } },
    },
  });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspace: { memberships: { some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } } } } },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: "Project not found or permission denied." }, { status: 404 });
  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ ok: true });
}
