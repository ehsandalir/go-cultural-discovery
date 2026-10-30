# GO — Cultural Discovery

Bilingual Persian/English cultural discovery app for films, books and music through 24 emotional vibes. This repository contains the source transferred from the existing Lovable project; it is an implementation snapshot, not the complete planned MVP.

- Lovable project: https://lovable.dev/projects/e3f74c39-baf4-4075-9ccf-b860f5fc3987
- Source snapshot and verification: [MIGRATION.md](MIGRATION.md)

## Local development

Tested with Node 24.22.1 and npm 11.9.0.

```sh
git clone https://github.com/ehsandalir/go-cultural-discovery.git
cd go-cultural-discovery
npm install
cp .env.example .env
# Set the required configuration in .env before using authentication/database features.
npm run dev
```

The original `bun.lock` is also retained for the Lovable/Bun workflow. npm resolves versions from `package.json`; it does not use `bun.lock`.

## Configuration

`.env` is intentionally not committed. Use `.env.example` for the required variable names:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`: browser-safe Supabase configuration. Never put a service-role key in a `VITE_` variable.
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`: server-side configuration.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only privileged operations, when needed.
- `LOVABLE_DB_MIGRATION_URL`: migration tooling only.

Configure authentication redirect URLs for the environment you deploy to. SQL migrations are in `drizzle/migrations`; do not blindly reapply them to an existing database. Keep API credentials in local environment files or your hosting provider's secret settings.

## Validation

```sh
npx tsc --noEmit
npm test
npm run build
```

The default production target is Cloudflare, inherited from the Lovable build package. For a local Node production preview in a POSIX shell:

```sh
NITRO_PRESET=node-server npm run build
npm run preview
```

In PowerShell, set `$env:NITRO_PRESET = "node-server"` before `npm run build`. Preview uses Nitro's generated output metadata for the selected target.

Build, type checking, routing tests and the local Node production smoke check pass. Live authentication and database flows need service configuration and have not been verified end to end after transfer. See [MIGRATION.md](MIGRATION.md) for scope and limitations.

## Stack

TanStack Start, React, TypeScript, Tailwind CSS, shadcn/ui, Drizzle, Supabase, and the existing Lovable build/auth integrations. Hosting and database data are managed separately from this repository.
