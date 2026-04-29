# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Next.js version notice:** This project uses Next.js 16 with React 19. APIs, conventions, and file structure may differ from training data. Consult `node_modules/next/dist/docs/` when uncertain and heed deprecation notices.

---

## Commands

```bash
npm run dev        # start local dev server (localhost:3000)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint with zero warnings allowed
npm run build      # production build (requires real env vars or the build will fail)
```

There are no tests. CI runs `typecheck` and `lint` in parallel, then `build`.

---

## Environment variables

Required at runtime (never at build time):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API — extraction and PDF reading |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis — dashboard persistence |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth |

Copy `.env.local.example` → `.env.local` for local dev. On Vercel these must be set in Project → Settings → Environment Variables (GitHub secrets are only for the CI/CD runner, not the deployed function).

---

## Architecture

### Request flow

```
Browser  →  POST /api/upload  →  parser  →  Claude API  →  Upstash Redis  →  { id }
Browser  ←  redirect /dashboard/[id]
/dashboard/[id] (server component)  →  GET /api/dashboard/[id]  →  Redis  →  DashboardData JSON
```

### Upload pipeline (`app/api/upload/route.ts`)

Single POST handler; MIME type + file extension determine the parser branch:

| Format | Parser |
|---|---|
| PDF | Sent natively to Claude as a base64 `document` block — **no `pdf-parse`** |
| Word (.docx/.doc) | `mammoth` → plain text |
| Excel (.xlsx/.xls) | `xlsx` → all sheets as CSV text |
| CSV / TXT | raw `buffer.toString("utf-8")` |
| PNG / JPG | `lib/parsers/image.ts` → base64, sent as Claude Vision `image` block |

`pdf-parse` is still a dependency but is **not imported at module level** (only lazily inside `parsePdf()`). Do not add it back as a top-level import — `pdfjs-dist` calls `DOMMatrix` at module evaluation time which crashes the Vercel Lambda.

Claude clients (`lib/claude.ts`) and Redis (`lib/kv.ts`) are **lazily initialised** on first request. Do not move them back to module-level `const` — if an env var is missing the route must return a JSON 500, not an HTML crash page.

### Dashboard rendering

`app/dashboard/[id]/page.tsx` is a Server Component that fetches `DashboardData` from Redis and passes it to `DashboardClient` (Client Component). `DashboardClient` owns `activeSubject` state, which is threaded down to every chart component to filter by subject simultaneously. If Redis returns null the page calls `notFound()`.

### Key types (`lib/types.ts`)

```typescript
Student { name, id?, scores: Record<string,number>, attendance?: number, grade? }
DashboardData { id, title, uploadedAt, subjects[], students[], meta: { totalStudents, averageScore, passRate, documentType } }
```

Claude always returns `scores: null` for attendance-only documents. `normalizeStudents()` in the upload route coerces `null` → `{}` before storing.

---

## Claude extraction (`lib/claude.ts`)

`extractDashboardData(content, filename)` accepts three content shapes:
- `string` — pre-extracted text (Word, Excel, CSV)
- `{ type: "image"; data: string; mediaType: string }` — base64 image for Vision
- `{ type: "pdf"; buffer: Buffer }` — raw PDF bytes sent as a native Claude document block

The system prompt is cached with `cache_control: { type: "ephemeral" }` to reduce latency and cost on repeated uploads.

---

## Deployment

CI/CD uses two GitHub Actions workflows:
- `ci.yml` — typecheck → lint → build (uses stub env vars so `next build` doesn't fail)
- `deploy.yml` — `vercel pull` → `vercel build` → `vercel deploy --prebuilt`

Production URL: `smart-dashboard-dusky.vercel.app`

Dashboards expire after 7 days (Redis TTL). The `maxDuration = 60` export on the upload route grants a 60-second Vercel function timeout for large files and slow Claude responses.
