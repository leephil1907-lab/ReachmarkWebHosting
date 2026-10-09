# Reachmark Webhosting

Reachmark Webhosting is a Next.js developer-console foundation for a Railway-class hosting platform. The root route opens the control plane at `/dashboard`; this repository intentionally has no marketing landing page.

## Current implementation status

**Control-plane UI and data-model foundation — not a production hosting service yet.**

Implemented:
- Dark responsive dashboard shell and project/service navigation
- Login and signup screens (visual UI only; authentication is not wired)
- Prisma/PostgreSQL schema for users, workspaces, projects, environments, services, deployments, logs, domains, and encrypted-secret storage fields
- SEO metadata, web manifest, icon, route transitions, and reduced-motion support
- Health endpoint with database connectivity reporting

Not implemented yet:
- Real authentication, sessions, password reset, or GitHub OAuth/repository installation
- Database-backed project creation and workspace authorization
- Build queue/worker, image builds, container orchestration, runtime networking, generated service URLs, or TLS provisioning
- Live logs, monitoring, billing/metering, or production rollback

The interface must not be interpreted as proof that deployments, uptime, or infrastructure are running. The deployment runtime reports as unconfigured until one is actually installed.

## Requirements

- Node.js 22+
- npm
- PostgreSQL 15+ for database-backed development

## Local development

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/leephil1907-lab/ReachmarkWebHosting.git
   cd ReachmarkWebHosting
   npm install
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL connection string. Keep secrets out of Git.
3. Generate the Prisma client and create the schema in your development database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open http://localhost:3000. The root route redirects to `/dashboard`. The health endpoint is available at `/api/health`.

## Docker

Build and run the web console with Docker:

```bash
docker build -t reachmark-webhosting .
docker run --rm -p 3000:3000 --env-file .env reachmark-webhosting
```

The database must be reachable from the container. Apply schema changes with `npx prisma db push` in a controlled development environment or use reviewed migrations for production.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Canonical public app URL used by metadata |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Reserved for the future GitHub OAuth integration |
| `SECRETS_ENCRYPTION_KEY` | Reserved for application-level secret encryption; not yet consumed by an implemented secrets API |

## Deployment

The Next.js app can be deployed to a Node.js hosting provider, but that alone does **not** provide the product's promised hosting runtime. Before offering customer deployments, implement and test authentication and workspace authorization, project persistence, a durable queue, isolated build workers, image registry/storage, container runtime/orchestration, ingress and TLS, resource limits, abuse protection, observability, and billing controls.

## License

No license has been declared yet. Do not assume the repository is open-source licensed for reuse.
