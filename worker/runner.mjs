"use strict";

import { PrismaClient } from "@prisma/client";
import { createDecipheriv } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, readFile, rm, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const execFile = promisify(execFileCallback);
const prisma = new PrismaClient();
const POLL_MS = Number(process.env.WORKER_POLL_MS || 3000);
const BASE_DOMAIN = (process.env.DEPLOYMENT_BASE_DOMAIN || "").toLowerCase().replace(/^\.+|\.+$/g, "");
const NETWORK = process.env.DOCKER_NETWORK || "reachmark-edge";
const CERT_RESOLVER = process.env.TRAEFIK_CERT_RESOLVER || "letsencrypt";
const APP_PORT_DEFAULT = Number(process.env.DEFAULT_APP_PORT || 3000);
const MAX_BUILD_MS = Number(process.env.MAX_BUILD_MS || 12 * 60 * 1000);
const MAX_HEALTH_MS = Number(process.env.MAX_HEALTH_MS || 60 * 1000);

function decryptSecret(payload) {
  const keyText = process.env.SECRETS_ENCRYPTION_KEY || "";
  if (!/^[a-fA-F0-9]{64}$/.test(keyText)) throw new Error("SECRETS_ENCRYPTION_KEY must be 64 hexadecimal characters.");
  const parts = payload.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted secret.");
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(keyText, "hex"), Buffer.from(parts[0], "base64url"));
  decipher.setAuthTag(Buffer.from(parts[1], "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(parts[2], "base64url")), decipher.final()]).toString("utf8");
}

function logText(value) {
  return String(value || "").slice(-12000).replace(/(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/g, "[REDACTED]");
}

async function addLog(deploymentId, level, message) {
  await prisma.deploymentLog.create({ data: { deploymentId, level, message: logText(message) } });
}

async function run(command, args, options) {
  return execFile(command, args, { timeout: MAX_BUILD_MS, maxBuffer: 8 * 1024 * 1024, ...options });
}

async function claimNext() {
  const deployment = await prisma.deployment.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    include: {
      service: {
        include: {
          project: { include: { workspace: { include: { memberships: { include: { user: { include: { githubConnection: true } } } } } } },
          environment: { include: { variables: true } }
        }
      }
    }
  });
  if (!deployment) return null;
  const claimed = await prisma.deployment.updateMany({
    where: { id: deployment.id, status: "QUEUED" },
    data: { status: "BUILDING", startedAt: new Date() }
  });
  return claimed.count === 1 ? deployment : null;
}

async function buildAndRun(deployment) {
  const service = deployment.service;
  const id = deployment.id;
  let workdir;
  let containerName = "rm-" + service.id.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 40);
  const generatedHost = BASE_DOMAIN ? service.id.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 50) + "." + BASE_DOMAIN : "";
  try {
    if (!BASE_DOMAIN) throw new Error("DEPLOYMENT_BASE_DOMAIN is not configured; set it to a domain with wildcard DNS and a Traefik ingress.");
    if (!service.repository || !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(service.repository)) {
      throw new Error("Service source must be an HTTPS GitHub repository URL.");
    }
    if (!service.port && service.type !== "STATIC") {
      await addLog(id, "warn", "No service port configured; defaulting to " + APP_PORT_DEFAULT + ".");
    }
    await addLog(id, "info", "Claimed deployment on dedicated worker.");
    await prisma.deployment.update({ where: { id }, data: { status: "BUILDING" } });
    await run("docker", ["network", "inspect", NETWORK], { env: process.env });
    workdir = await mkdtemp(path.join(tmpdir(), "reachmark-build-"));
    const sourceDir = path.join(workdir, "source");
    await mkdir(sourceDir, { recursive: true });

    let githubToken = "";
    const memberships = service.project.workspace.memberships || [];
    for (const membership of memberships) {
      if (membership.user.githubConnection) {
        githubToken = decryptSecret(membership.user.githubConnection.accessTokenEncrypted);
        break;
      }
    }
    const branch = deployment.branch || service.branch || "main";
    if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch) || branch.startsWith("-")) throw new Error("Branch name contains unsupported characters.");
    if (service.type !== "APPLICATION" && service.type !== "WORKER" && service.type !== "STATIC") throw new Error("This worker currently runs application, worker, and Dockerfile-based static services only.");
    const cloneEnv = { ...process.env };
    if (githubToken) {
      cloneEnv.GIT_CONFIG_COUNT = "1";
      cloneEnv.GIT_CONFIG_KEY_0 = "http.extraheader";
      cloneEnv.GIT_CONFIG_VALUE_0 = "AUTHORIZATION: basic " + Buffer.from("x-access-token:" + githubToken).toString("base64");
    }
    await addLog(id, "info", "Fetching source branch " + branch + ".");
    await run("git", ["clone", "--depth", "1", "--branch", branch, service.repository, sourceDir], { env: cloneEnv });
    delete cloneEnv.GIT_CONFIG_VALUE_0;
    githubToken = "";

    const dockerfilePath = path.join(sourceDir, "Dockerfile");
    let dockerfileExists = true;
    try { await readFile(dockerfilePath); } catch { dockerfileExists = false; }
    if (!dockerfileExists) {
      const packagePath = path.join(sourceDir, "package.json");
      let packageJson;
      try { packageJson = JSON.parse(await readFile(packagePath, "utf8")); } catch { throw new Error("No Dockerfile or valid package.json found. Add a Dockerfile to the repository."); }
      if (!packageJson.scripts || !packageJson.scripts.start) throw new Error("No Dockerfile found and package.json has no start script.");
      const port = service.port || APP_PORT_DEFAULT;
      const newline = String.fromCharCode(10);
      const buildLine = service.buildCommand ? "RUN " + service.buildCommand.split(String.fromCharCode(10)).join(" ").split(String.fromCharCode(13)).join(" ") : "RUN npm run build --if-present";
      const generated = ["FROM node:22-alpine", "WORKDIR /app", "COPY package*.json ./", "RUN npm install", "COPY . .", buildLine, "ENV NODE_ENV=production", "EXPOSE " + port, "CMD [\"npm\",\"run\",\"start\"]"].join(newline) + newline;
      await writeFile(dockerfilePath, generated, "utf8");
      await addLog(id, "info", "Generated a Node.js Dockerfile because the repository did not contain one.");
    }
    const imageName = "reachmark/" + service.id.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40) + ":" + id.toLowerCase();
    await addLog(id, "info", "Building container image.");
    const buildResult = await run("docker", ["build", "--pull", "--tag", imageName, sourceDir], { env: process.env });
    if (buildResult.stdout) await addLog(id, "info", buildResult.stdout);
    if (buildResult.stderr) await addLog(id, "info", buildResult.stderr);
    await prisma.deployment.update({ where: { id }, data: { status: "DEPLOYING", imageRef: imageName } });
    await addLog(id, "info", "Image built. Replacing the previous service container.");

    await run("docker", ["rm", "--force", containerName], { env: process.env }).catch(() => null);
    const envFile = path.join(workdir, "runtime.env");
    const envRows = ["NODE_ENV=production", "PORT=" + (service.port || APP_PORT_DEFAULT)];
    for (const variable of service.environment.variables || []) {
      const value = decryptSecret(variable.valueEncrypted);
      if (value.includes("\n") || value.includes("\r")) throw new Error("Environment variable " + variable.key + " contains a newline; this worker requires single-line values.");
      envRows.push(variable.key + "=" + value);
    }
    await writeFile(envFile, envRows.join("\n") + "\n", { mode: 0o600 });
    await chmod(envFile, 0o600);
    const slug = ("rm" + service.id).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 50);
    const port = service.port || APP_PORT_DEFAULT;
    const labels = [
      "--label", "traefik.enable=true",
      "--label", "traefik.docker.network=" + NETWORK,
      "--label", "traefik.http.routers." + slug + ".rule=Host(\"" + generatedHost + "\")",
      "--label", "traefik.http.routers." + slug + ".entrypoints=websecure",
      "--label", "traefik.http.routers." + slug + ".tls=true",
      "--label", "traefik.http.routers." + slug + ".tls.certresolver=" + CERT_RESOLVER,
      "--label", "traefik.http.services." + slug + ".loadbalancer.server.port=" + port,
      "--label", "reachmark.service.id=" + service.id,
      "--label", "reachmark.deployment.id=" + id
    ];
    const args = ["run", "--detach", "--name", containerName, "--network", NETWORK, "--memory", "512m", "--cpus", "1", "--pids-limit", "256", "--security-opt", "no-new-privileges", "--cap-drop", "ALL", "--restart", "unless-stopped", "--env-file", envFile, ...labels, imageName];
    if (service.startCommand) args.push("sh", "-lc", service.startCommand);
    await run("docker", args, { env: process.env });
    await rm(envFile, { force: true });

    await prisma.deployment.update({ where: { id }, data: { status: "STARTING" } });
    await addLog(id, "info", "Container started. Waiting for the application port to respond.");
    const inspect = await run("docker", ["inspect", "--format", "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}", containerName], { env: process.env });
    const ip = inspect.stdout.trim();
    if (!ip) throw new Error("Container started but Docker did not return a network IP.");
    const healthDeadline = Date.now() + MAX_HEALTH_MS;
    let healthy = false;
    while (Date.now() < healthDeadline) {
      try {
        const response = await fetch("http://" + ip + ":" + port, { signal: AbortSignal.timeout(2500) });
        if (response.status < 500) { healthy = true; break; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    if (!healthy) throw new Error("Container did not return a non-5xx HTTP response on port " + port + " within the health-check window.");
    await prisma.deployment.update({ where: { id }, data: { status: "HEALTHY", finishedAt: new Date() } });
    await prisma.service.update({ where: { id: service.id }, data: { status: "HEALTHY" } });
    await addLog(id, "info", "Health check passed. Service URL: https://" + generatedHost);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.deployment.update({ where: { id }, data: { status: "FAILED", finishedAt: new Date() } }).catch(() => null);
    await prisma.service.update({ where: { id: service.id }, data: { status: "FAILED" } }).catch(() => null);
    await addLog(id, "error", message);
    if (containerName) await run("docker", ["rm", "--force", containerName], { env: process.env }).catch(() => null);
  } finally {
    if (workdir) await rm(workdir, { recursive: true, force: true }).catch(() => null);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  if (!process.env.SECRETS_ENCRYPTION_KEY) throw new Error("SECRETS_ENCRYPTION_KEY is required.");
  console.log("Reachmark worker started. Poll interval: " + POLL_MS + "ms.");
  for (;;) {
    try {
      const deployment = await claimNext();
      if (deployment) await buildAndRun(deployment);
      else await new Promise(resolve => setTimeout(resolve, POLL_MS));
    } catch (error) {
      console.error("Worker loop error:", error);
      await new Promise(resolve => setTimeout(resolve, POLL_MS));
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
