import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/secrets";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ projectId: string }> };

async function ownedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({ where: { id: projectId, workspace: { memberships: { some: { userId } } } }, include: { environments: { where: { kind: "PRODUCTION" }, take: 1 } } });
}

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await ownedProject(projectId, user.id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const environment = project.environments[0];
  if (!environment) return NextResponse.json({ variables: [] });
  const variables = await prisma.environmentVariable.findMany({ where: { environmentId: environment.id }, select: { id: true, key: true, isSecret: true, createdAt: true, updatedAt: true }, orderBy: { key: "asc" } });
  return NextResponse.json({ variables });
}

export async function POST(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { projectId } = await params;
  const project = await ownedProject(projectId, user.id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const environment = project.environments[0];
  if (!environment) return NextResponse.json({ error: "Production environment not found." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const key = typeof body.key === "string" ? body.key.trim() : "";
  const value = typeof body.value === "string" ? body.value : "";
  if (!/^[A-Z_][A-Z0-9_]{0,127}$/.test(key) || value.length < 1 || value.length > 10000 || value.includes(String.fromCharCode(10)) || value.includes(String.fromCharCode(13))) {
    return NextResponse.json({ error: "Use a valid environment key and a single-line value up to 10,000 characters." }, { status: 400 });
  }
  try {
    const valueEncrypted = encryptSecret(value);
    const variable = await prisma.environmentVariable.upsert({
      where: { environmentId_key: { environmentId: environment.id, key } },
      create: { environmentId: environment.id, key, valueEncrypted, isSecret: body.isSecret !== false },
      update: { valueEncrypted, isSecret: body.isSecret !== false },
      select: { id: true, key: true, isSecret: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ variable }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("SECRETS_ENCRYPTION_KEY") ? error.message : "Could not save the environment variable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
