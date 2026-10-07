import { NextResponse } from "next/server";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  return NextResponse.json({
    service: "reachmark-webhosting",
    status: "ok",
    database: databaseConfigured ? "configured" : "not_configured",
    deploymentRuntime: "not_configured",
    timestamp: new Date().toISOString(),
  });
}
