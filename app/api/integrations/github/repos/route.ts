import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { decryptSecret } from "@/lib/secrets";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const connection = await prisma.gitHubConnection.findUnique({ where: { userId: user.id } });
  if (!connection) return NextResponse.json({ error: "Connect GitHub first." }, { status: 409 });
  try {
    const token = decryptSecret(connection.accessTokenEncrypted);
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store",
    });
    const repos = await response.json();
    if (!response.ok || !Array.isArray(repos)) return NextResponse.json({ error: "GitHub repository lookup failed. Reconnect GitHub if access was revoked." }, { status: 502 });
    return NextResponse.json({ repositories: repos.map((repo: any) => ({ id: repo.id, fullName: repo.full_name, name: repo.name, private: repo.private, defaultBranch: repo.default_branch, htmlUrl: repo.html_url, cloneUrl: repo.clone_url, updatedAt: repo.updated_at })) });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("SECRETS_ENCRYPTION_KEY") ? error.message : "Could not retrieve repositories.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
