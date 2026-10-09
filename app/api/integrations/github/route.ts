import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const connection = await prisma.gitHubConnection.findUnique({ where: { userId: user.id }, select: { githubLogin: true, scopes: true, connectedAt: true } });
  return NextResponse.json({ connected: Boolean(connection), connection });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await prisma.gitHubConnection.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
