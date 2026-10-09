import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/dashboard/settings?github=not-configured", request.url));
  }
  const state = randomBytes(32).toString("base64url");
  const callback = new URL("/api/integrations/github/callback", process.env.NEXT_PUBLIC_APP_URL || request.url).toString();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callback);
  url.searchParams.set("scope", "read:user repo");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("reachmark_github_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
