import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const membership = user.memberships[0];
  if (!membership) return NextResponse.json({ projects: [] });
  const projects = await prisma.project.findMany({
    where: { workspaceId: membership.workspaceId },
    include: { environments: true, services: { include: { deployments: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const membership = user.memberships[0];
  if (!membership) return NextResponse.json({ error: "No workspace is associated with this account." }, { status: 400 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : "";
    if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Project name must be 2–80 characters." }, { status: 400 });
    const base = slugify(name) || "project";
    let slug = base;
    let suffix = 2;
    while (await prisma.project.findUnique({ where: { workspaceId_slug: { workspaceId: membership.workspaceId, slug } } })) {
      slug = `${base}-${suffix++}`;
    }
    const project = await prisma.project.create({
      data: {
        name, slug, description: description || null, workspaceId: membership.workspaceId,
        environments: { create: [{ name: "production", kind: "PRODUCTION" }, { name: "preview", kind: "PREVIEW" }] },
      },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("project creation failed", error);
    return NextResponse.json({ error: "Could not create project." }, { status: 500 });
  }
}
