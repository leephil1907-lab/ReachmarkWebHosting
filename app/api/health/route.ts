import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  let database: "connected" | "not_configured" | "unreachable" = "not_configured";

  if (databaseConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch {
      database = "unreachable";
    }
  }

  const healthy = !databaseConfigured || database === "connected";

  return NextResponse.json(
    {
      service: "reachmark-webhosting",
      status: healthy ? "ok" : "degraded",
      database,
      deploymentRuntime: "not_configured",
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
