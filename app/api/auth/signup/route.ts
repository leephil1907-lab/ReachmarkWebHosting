import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createSession, hashPassword, safeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || password.length > 200) {
      return NextResponse.json({ error: "Enter a name, valid email, and password of at least 10 characters." }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name, email, passwordHash } });
      const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "workspace";
      const slug = `${base}-${created.id.slice(-6)}`;
      const workspace = await tx.workspace.create({ data: { name: `${name}'s workspace`, slug } });
      await tx.membership.create({ data: { userId: created.id, workspaceId: workspace.id, role: "OWNER" } });
      return created;
    });
    await createSession(user.id);
    return NextResponse.json({ user: safeUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    console.error("signup failed", error);
    return NextResponse.json({ error: "Account creation failed. Check that the database is configured." }, { status: 500 });
  }
}
