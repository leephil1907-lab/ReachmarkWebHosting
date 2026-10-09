import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ serviceId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { serviceId } = await params;
  const service = await prisma.service.findFirst({
    where: { id: serviceId, project: { workspace: { memberships: { some: { userId: user.id } } } } },
    select: { id: true },
  });
  if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
  const deployments = await prisma.deployment.findMany({ where: { serviceId }, include: { logs: { orderBy: { timestamp: "asc" }, take: 200 } }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ deployments, runtime: "not_configured" });
}

export async function POST(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { serviceId } = await params;
  const service = await prisma.service.findFirst({
    where: { id: serviceId, project: { workspace: { memberships: { some: { userId: user.id } } } } },
    select: { id: true, branch: true, repository: true, type: true },
  });
  if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
  if (!service.repository) return NextResponse.json({ error: "Configure a GitHub repository before queuing a deployment." }, { status: 400 });
  if (service.type !== "APPLICATION" && service.type !== "WORKER" && service.type !== "STATIC") return NextResponse.json({ error: "This service type is not supported by the deployment worker." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const deployment = await prisma.deployment.create({
    data: {
      serviceId,
      status: "QUEUED",
      branch: typeof body.branch === "string" ? body.branch.slice(0, 120) : service.branch,
      sourceRef: service.repository,
      logs: { create: { level: "warn", message: "Deployment queued in the control plane. No build worker is configured, so this deployment will not run until a worker is connected." } },
    },
  });
  return NextResponse.json({ deployment, runtime: "not_configured" }, { status: 202 });
}
