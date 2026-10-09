import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.project.findFirst({ where: { id: projectId, workspace: { memberships: { some: { userId: user.id } } } }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const domains = await prisma.domain.findMany({ where: { service: { projectId } }, include: { service: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ domains });
}

export async function POST(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.project.findFirst({ where: { id: projectId, workspace: { memberships: { some: { userId: user.id } } } }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const hostname = typeof body.hostname === "string" ? body.hostname.trim().toLowerCase().replace(/\.$/, "") : "";
  const serviceId = typeof body.serviceId === "string" ? body.serviceId : "";
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) return NextResponse.json({ error: "Enter a valid fully qualified domain name." }, { status: 400 });
  const service = await prisma.service.findFirst({ where: { id: serviceId, projectId }, select: { id: true } });
  if (!service) return NextResponse.json({ error: "Choose a service in this project." }, { status: 400 });
  try {
    const domain = await prisma.domain.create({ data: { hostname, serviceId } });
    return NextResponse.json({ domain, tls: "pending", message: "Domain record saved. DNS verification and HTTPS are not provisioned until ingress and certificate automation are configured." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That domain may already be attached." }, { status: 409 });
  }
}
