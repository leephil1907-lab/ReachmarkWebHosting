import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/secrets";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await getCurrentUser();
  const jar = await cookies();
  const expectedState = jar.get("reachmark_github_oauth_state")?.value;
  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const redirect = (status: string) => {
    const response = NextResponse.redirect(new URL(`/dashboard/settings?github=${status}`, process.env.NEXT_PUBLIC_APP_URL || request.url));
    response.cookies.delete("reachmark_github_oauth_state");
    return response;
  };
  if (!user) return redirect("signin-required");
  if (!expectedState || !returnedState || expectedState !== returnedState || !code) return redirect("state-error");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return redirect("not-configured");
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      cache: "no-store",
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || typeof tokenData.access_token !== "string") return redirect("token-error");
    const accessToken = tokenData.access_token as string;
    const userResponse = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
    const githubUser = await userResponse.json();
    if (!userResponse.ok || !githubUser.id || !githubUser.login) return redirect("profile-error");
    const encrypted = encryptSecret(accessToken);
    await prisma.gitHubConnection.upsert({
      where: { userId: user.id },
      create: { userId: user.id, githubUserId: String(githubUser.id), githubLogin: String(githubUser.login), accessTokenEncrypted: encrypted, scopes: typeof tokenData.scope === "string" ? tokenData.scope : "" },
      update: { githubUserId: String(githubUser.id), githubLogin: String(githubUser.login), accessTokenEncrypted: encrypted, scopes: typeof tokenData.scope === "string" ? tokenData.scope : "", connectedAt: new Date() },
    });
    return redirect("connected");
  } catch (error) {
    console.error("GitHub OAuth callback failed", error);
    return redirect("connection-error");
  }
}
