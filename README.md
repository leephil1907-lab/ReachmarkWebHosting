# Reachmark Webhosting

Reachmark Webhosting is a developer control-plane foundation for a Railway-class hosting platform. The root route redirects to `/dashboard`; there is no marketing landing page.

## Working in this repository

Implemented in the current code:
- Responsive dashboard shell with sign-in protection
- Email/password registration and sign-in using Node.js scrypt password hashes
- Opaque random session tokens stored as SHA-256 hashes, HTTP-only cookies, expiry, and sign-out
- Automatic workspace creation during registration
- Workspace-scoped project CRUD, with production and preview environments created for each project
- Service configuration records for applications, workers, cron jobs, static sites and database declarations
- Deployment history records and explicit status/log messages
- Optional Docker worker that clones GitHub sources, builds Docker images, starts resource-limited containers, checks HTTP health, and publishes generated hostnames through Traefik
- GitHub OAuth connection and repository discovery (requires OAuth app credentials)
- AES-256-GCM encryption for stored GitHub tokens and environment-variable values (requires a 32-byte hex key)
- Environment-variable metadata/value write API; secret values are never returned by the API
- Domain record API with hostname validation
- PostgreSQL Prisma schema, Dockerfile, local PostgreSQL Compose service, health endpoint, SEO metadata, app icon and transitions
- GitHub Actions checks for Prisma validation/client generation, TypeScript and Next.js production build

## Important runtime boundary

This repository is **not yet a complete public hosting provider**. The web control plane can save projects, service configuration, secrets and deployment records. A deployment request currently creates a queued record and a clear log that no build worker is connected. It does not build or run arbitrary customer code.

Not yet implemented/provisioned:
- Durable external job queue, multi-worker scheduling and build cancellation
- Zero-downtime releases, automatic rollback, image registry and persistent volumes
- Custom-domain DNS verification/routing and managed database provisioning
- Live resource metrics, log streaming, alerts, quotas and billing/metering
- Production-grade rate limiting, account recovery, team invitation management, and external security review
- Live resource metrics, log streaming, alerts, quotas and billing/metering
- Production-grade rate limiting, account recovery, team invitation management, and external security review

Do not advertise a queued deployment as live. The optional worker executes customer-controlled Docker build instructions, so run it only on a dedicated, disposable worker host—not on the web-console host or a machine containing unrelated workloads. Docker socket access is effectively host-root access. Review and sandbox this threat model before accepting untrusted customer workloads.

## Requirements

- Node.js 22+
- npm
- Docker and Docker Compose for local PostgreSQL
- PostgreSQL 15+ for hosted use

## Local setup

```bash
git clone https://github.com/leephil1907-lab/ReachmarkWebHosting.git
cd ReachmarkWebHosting
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/dashboard`; unauthenticated users are redirected to `/login`. Create an account at `/signup`. Health checks are at `/api/health`.

Generate an encryption key before using GitHub OAuth or secret storage:

```bash
openssl rand -hex 32
```

Put the generated value in `SECRETS_ENCRYPTION_KEY`. Never commit `.env` or expose this key in client-side variables.

## GitHub OAuth setup

Create a GitHub OAuth App. Set its callback URL to:

- Local: `http://localhost:3000/api/integrations/github/callback`
- Production: `https://YOUR-DOMAIN/api/integrations/github/callback`

Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`, and `SECRETS_ENCRYPTION_KEY`. Then sign in and connect GitHub from Dashboard → Settings. The OAuth flow requests `read:user repo` access so it can list private repositories the user authorizes; only grant this to an app you trust.

## Optional runtime worker and HTTPS ingress

The worker and Traefik stack is opt-in and requires a dedicated Linux host with Docker Engine, public inbound ports 80/443, and a DNS wildcard such as `*.apps.example.com` pointing to that host. Create the external runtime network and configure the worker secrets before starting it:

```bash
docker network create reachmark-edge
export ACME_EMAIL=ops@example.com
export DEPLOYMENT_BASE_DOMAIN=apps.example.com
export SECRETS_ENCRYPTION_KEY="$(openssl rand -hex 32)"
export WORKER_DATABASE_URL='postgresql://reachmark:YOUR_PASSWORD@postgres:5432/reachmark?schema=public'
docker compose -f docker-compose.runtime.yml up -d --build
```

The `WORKER_DATABASE_URL` hostname `postgres` works when the worker shares the `reachmark-control` network created by `docker-compose.yml`. For managed PostgreSQL, set it to the private database URL instead. Configure the same `SECRETS_ENCRYPTION_KEY` on the web app and worker. Configure GitHub OAuth in the web app, connect GitHub, create an `APPLICATION` service with a valid GitHub repository, and queue a deployment. The worker currently supports `APPLICATION`, `WORKER`, and Dockerfile-based `STATIC` services. The repository must contain a Dockerfile or a Node.js `package.json` with a `start` script. Generated URLs use the service ID under `DEPLOYMENT_BASE_DOMAIN`; custom-domain records are not yet routed by Traefik.

The worker builds and runs customer code. Use a separate host, restrict network egress, monitor resource usage, keep Docker/Traefik updated, and do not expose the Docker socket. The supplied socket proxy is for Traefik's read-only discovery; the worker still needs host Docker access to build and run containers.

## Docker

Build and run the web console:

```bash
docker build -t reachmark-webhosting .
docker run --rm -p 3000:3000 --env-file .env reachmark-webhosting
```

The PostgreSQL server must be reachable from the application container. For production, use managed PostgreSQL and reviewed Prisma migrations rather than running `db push` on every release.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Public app origin, used for OAuth callback and metadata |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth credentials |
| `SECRETS_ENCRYPTION_KEY` | 32-byte AES-256 key encoded as 64 hex characters |

## License

No license has been declared yet. Do not assume the repository is open-source licensed for reuse.
