# Architecture Overview

This repository is the companion demo for a blog post about running **AI coding
agents inside cloud sandboxes**. It is a [TanStack Start](https://tanstack.com/start)
application (React 19 + Vite + Nitro) that lets you type a prompt into a browser
chat box and have a real **Claude Code** agent spin up in a disposable cloud VM,
clone this very repo, do the work, and open a pull request — all while the
conversation streams back to the browser and survives page reloads and server
restarts.

The interesting part of this project is not the UI (which is intentionally
minimal) but the **wiring of four TanStack libraries**: `@tanstack/ai`,
`@tanstack/ai-claude-code`, `@tanstack/ai-sandbox`, and
`@tanstack/ai-persistence`, backed by a Postgres database through Drizzle.

---

## 1. The big picture

```
Browser (useChat)                     Server (TanStack Start API route)
┌────────────────────┐   POST /api/ai/vercel-sandbox   ┌──────────────────────────┐
│ admin-vercel.tsx   │ ───── messages, threadId, ────► │ chat({                   │
│  <AgentChat/>      │          runId (SSE)            │   adapter: claudeCodeText│
│                    │                                 │   middleware: [          │
│  fetchServerSent-  │ ◄──── Server-Sent Events ────── │     withPersistence,     │
│  Events + useChat  │        (token stream)           │     withSandbox,         │
└────────────────────┘                                 │   ]})                    │
         │                                             └───────────┬──────────────┘
         │ GET (resume / reconstruct)                              │
         ▼                                                         ▼
   durable replay                                   ┌──────────────────────────────┐
                                                    │ Cloud sandbox (Vercel /       │
   Postgres (Drizzle)                               │ Railway / Daytona)            │
   chat_threads / chat_runs                         │  • clone github repo          │
   chat_interrupts / chat_metadata                  │  • npm install, install gh    │
                                                    │  • run `claude` CLI           │
                                                    │  • git push + gh pr create    │
                                                    └──────────────────────────────┘
```

A single user prompt flows: **browser → API route → `chat()` pipeline →
Claude Code CLI running inside a cloud VM → tokens streamed back → persisted to
Postgres at every step**.

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | TanStack Start (`@tanstack/react-start`) on React 19 |
| Router | TanStack Router, file-based (`src/routes/`), SSR + Query integration |
| Build/dev | Vite 8 with the TanStack Start plugin |
| Server runtime | Nitro (generic Node server adapter → `dist/server/index.mjs`) |
| Data fetching | TanStack Query (wired into the router context) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Database | Postgres via `postgres` driver + Drizzle ORM (`drizzle-orm@1.0 rc`) |
| AI orchestration | `@tanstack/ai` + `@tanstack/ai-claude-code` |
| Durable chat state | `@tanstack/ai-persistence` |
| Sandboxes | `@tanstack/ai-sandbox` + Vercel / Railway / Daytona / Cloudflare providers |
| Icons | `lucide-react` |

Config highlights:
- `vite.config.ts` — composes the `devtools`, `nitro`, `tailwindcss`,
  `tanstackStart`, and `viteReact` plugins. Sentry is marked external in the
  Nitro rollup config.
- `tsconfig.json` — strict TS, `moduleResolution: bundler`, path aliases
  `#/*` and `@/*` both map to `src/*` (also declared in `package.json` `imports`).
- `tsr.config.json` / `.cta.json` — TanStack Router/Create-TanStack-App metadata.
- `drizzle.config.ts` — reads `process.env.POSTGRES`, PostgreSQL dialect,
  schema at `src/drizzle/schema.ts`, output to `src/drizzle`.

---

## 3. Application shell & routing

Routes live in `src/routes/` and are compiled into `src/routeTree.gen.ts`
(generated — do not edit, regenerate with `npm run generate-routes`).

- `src/router.tsx` — `getRouter()` builds the TanStack Router with the Query
  client in context, `defaultPreload: "intent"`, and wires in SSR + Query via
  `setupRouterSsrQueryIntegration`.
- `src/routes/__root.tsx` — the root layout (`shellComponent`). Renders the HTML
  document, a left sidebar nav linking to **C++** and **JavaScript** pages, a
  `<main>` for route content, and the TanStack Router + Query devtools panels.
- `src/integrations/tanstack-query/` — `root-provider.tsx` creates the
  `QueryClient` placed in router context; `devtools.tsx` exports the Query
  devtools panel.

### Content pages (the "cover story")
- `src/routes/index.tsx` — a trivial "Programming Language Explorer" home page.
- `src/routes/cpp.tsx`, `src/routes/javascript.tsx` — static descriptive pages.

These exist mainly so the agent has a real, small repo to modify (e.g. "add a
Rust page"). They are the demo's content surface.

### Admin / chat pages (the real demo)
- `src/routes/admin-vercel.tsx` — the most complete UI. Lists recent sessions
  (via the `readSessions` loader), lets you **Load** or **Delete** a past
  thread, and spawn one or more `<AgentChat>` instances. Each `<AgentChat>`:
  - gets a `threadId` (a `uuid`, or one taken from the `?threadId=` query
    string, or a loaded session);
  - uses `useChat({ connection: fetchServerSentEvents("/api/ai/vercel-sandbox"),
    threadId, persistence: true })` from `@tanstack/ai-react`;
  - renders user bubbles vs. agent text and a spinner while `isLoading`.
  The page can spawn several concurrent agents ("New session" → N `<AgentChat>`).
- `src/routes/admin-railway.tsx` — same pattern, pointed at
  `/api/ai/railway-sandbox` + `deleteRailwaySession`.
- `src/routes/admin-daytona.tsx` — a stripped-down version (fixed `threadId: "1"`,
  no persistence/session list) pointed at `/api/ai/daytona-sandbox`.

The three admin pages are the same app wired to three different sandbox
providers, so the blog post can compare them.

---

## 4. The AI request pipeline (server side)

Each provider has an API route under `src/routes/api/ai/`. They are TanStack
file routes that expose HTTP handlers via the `server.handlers` property. Take
`src/routes/api/ai/vercel-sandbox.ts`:

**POST** (start / continue a run):
```ts
const { messages, threadId, runId } = await request.json();
const stream = chat({
  adapter: claudeCodeText("claude-opus-4-8"),
  messages, threadId, runId,
  middleware: [withPersistence(chatPersistence), withSandbox(sandboxVercel)],
});
return toServerSentEventsResponse(stream, {
  durability: { adapter: memoryStream(request) },
});
```
- `chat()` from `@tanstack/ai` is the core orchestrator. It produces a token
  stream.
- `claudeCodeText("claude-opus-4-8")` is the **adapter**: instead of calling an
  LLM API directly, it drives the **Claude Code CLI** (see §7).
- **Middleware** wrap the run:
  - `withPersistence(chatPersistence)` reads/writes all chat state to Postgres.
  - `withSandbox(sandboxVercel)` makes the agent execute inside a cloud VM.
- `toServerSentEventsResponse(..., { durability })` streams tokens to the
  browser as SSE while also recording them to a durable `memoryStream`, so the
  stream can be replayed.

**GET** (resume / reconstruct):
```ts
const durability = memoryStream(request, { firstChunkDeadlineMs: 5*60*1000 });
if (durability.resumeFrom() !== null) {
  return resumeServerSentEventsResponse({ adapter: durability });
}
return reconstructChat(chatPersistence, request);
```
- If the client reconnects mid-stream, `resumeServerSentEventsResponse` replays
  from where it left off (durable streaming — survives reloads).
- Otherwise `reconstructChat` rebuilds the full conversation from Postgres.

`railway-sandbox.ts` is identical except it uses `sandboxRailway`.
`daytona-sandbox.ts` is simpler: it defines its sandbox inline, uses only
`withSandbox` (no persistence, no durable resume), and only handles POST.

---

## 5. Sandbox definitions (`src/lib/`)

`src/lib/vercel-sandbox.ts` and `src/lib/railway-sandbox.ts` declare *how* an
agent's environment is built, using `@tanstack/ai-sandbox`:

```ts
export const sandboxVercel = defineSandbox({
  id: "repo-agent",
  provider: vercelSandbox({}),
  workspace: defineWorkspace({
    source: githubRepo({ repo: "arackaf/tanstack-ai-sandboxes-blog-post" }),
    setup: [
      "sudo npm install -g @anthropic-ai/claude-code",
      "sudo dnf install -y 'dnf-command(config-manager)'",
      "sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo",
      "sudo dnf install -y gh",
      "npm install",
    ],
    secrets: createSecrets({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      GH_TOKEN: process.env.GH_TOKEN ?? "",
    }),
    instructions: "Accomplish the user's request and create a pull request. ...",
  }),
  lifecycle: { reuse: "thread" },
});
```

Key ideas:
- **`provider`** — swaps the backing compute: `vercelSandbox`, `railwaySandbox`,
  `daytonaSandbox` (and `cloudflare` is installed as a dependency). This is the
  whole point of the demo: identical agent logic, interchangeable infra.
- **`workspace.source`** — the VM clones this GitHub repo at boot.
- **`workspace.setup`** — shell commands to provision the VM: install the Claude
  Code CLI, install the GitHub CLI (`gh`), and `npm install`. (Vercel/Daytona
  use Amazon-Linux-style `dnf`; Railway's image already has `gh`, so it only runs
  `npm install`.)
- **`secrets`** — `ANTHROPIC_API_KEY` (so Claude Code can call the model) and
  `GH_TOKEN` (so the agent can push and open PRs) are injected into the VM env.
- **`instructions`** — the agent's standing orders: do the task and open a PR.
  This is the same text as the repo's `AGENTS.md` / `CLAUDE.md`.
- **`lifecycle: { reuse: "thread" }`** — one sandbox per chat thread, reused
  across turns in that thread (not one per message, not one global).

The Daytona route inlines the same definition inside its POST handler and passes
an explicit `apiKey`.

---

## 6. Persistence layer (`src/drizzle/`)

All durable chat state lives in Postgres and is accessed through Drizzle.

- `db.ts` — creates the `postgres` client from `process.env.POSTGRES` and wraps
  it with `drizzle()`.
- `schema.ts` — four tables, typed against `@tanstack/ai` /
  `@tanstack/ai-persistence` types:
  - **`chat_threads`** — `threadId` → full `messages_json` transcript +
    `updated_at`. One row per conversation (the authoritative transcript).
  - **`chat_runs`** — one row per agent *run*: `status`, timing, token `usage`,
    `sandboxKey`, `detachedSince` (for reclaiming orphaned runs),
    `cancelRequested`, `driverEpoch`, and parent/subagent links for nested
    agents. Indexed for status/detached, thread/started, parent/started lookups.
  - **`chat_interrupts`** — human-in-the-loop / tool-permission interrupts:
    pending → resolved/cancelled with request + response payloads.
  - **`chat_metadata`** — generic `(namespace, key) → jsonb` key-value store.
- `chat-persistence.ts` — the heart of the persistence integration. It
  implements the four stores the `@tanstack/ai-persistence` contract expects
  (`MessageStore`, `RunStore`, `InterruptStore`, `MetadataStore`) over Drizzle,
  then composes them with `defineAIPersistence(...)` into the exported
  `chatPersistence`. The implementation is carefully written to match the
  reference in-memory backend's semantics, with notable invariants documented in
  comments:
  - unknown threads load as `[]`, never `null`;
  - `saveThread` is a full overwrite (upsert) of the authoritative transcript;
  - `createOrResume` is **idempotent** and race-safe (insert-if-absent then
    re-read the winning row) so resume / double-submit are safe;
  - `update` uses `'field' in patch` (not `!== undefined`) so an explicit
    `undefined` can clear a column to `NULL` (e.g. reattach clearing
    `detachedSince`);
  - `error` + `errorCode` always move together;
  - interrupt `create` is insert-if-absent so a duplicate can't revert a resolved
    interrupt to pending;
  - `listReclaimable` finds still-running runs whose `detachedSince` is past a
    TTL cutoff, enabling recovery of runs orphaned by a server crash.

This is what makes the chat **durable**: a run can be detached from one server
process and reattached/resumed by another, and the browser can reconnect to a
stream in progress.

---

## 7. How the Claude Code adapter actually runs

The three stray-looking files at the repo root reveal how `claudeCodeText`
executes the agent *inside the sandbox*:

- `tanstack-claude-argv-run-*.json` — the exact CLI invocation:
  ```
  claude --setting-sources project -p --output-format stream-json --verbose
         --model claude-opus-4-8 --include-partial-messages
         --permission-mode bypassPermissions
  ```
  i.e. it runs the Claude Code CLI headless (`-p`), emits a streaming JSON event
  format (which the adapter parses into the token stream), uses the Opus model,
  and bypasses interactive permission prompts (the agent runs autonomously).
- `tanstack-claude-run-*.mjs` — a tiny Node wrapper that reads that argv JSON
  (and optionally substitutes a `__TANSTACK_SCHEMA__` placeholder), then
  `spawn`s the command, piping stdin/stdout/stderr through. This is the shim the
  adapter drops into the workspace to launch `claude`.
- `.tanstack-projected-*` — an empty marker/projection file from the tooling.

These are build/run artifacts (and are among the files `.gitignore` is designed
to keep noise down around); they illustrate that "the model" here is literally
the Claude Code CLI driven programmatically, not a raw LLM API call.

---

## 8. Server functions (`src/server-functions/`)

TanStack Start server functions (`createServerFn`) callable from the client:
- `readSessions.ts` — GET: returns the 20 most recently updated threads with a
  50-char preview taken from the first user message. Used as the loader for the
  admin pages' session list.
- `deleteVercelSession.ts` / `deleteRailwaySession.ts` — POST (validated with a
  `{ threadId }` payload): look up every run for the thread and call
  `sandbox.destroy({ runId, threadId })` to tear down the cloud VM(s) for that
  session.

---

## 9. End-to-end flow of one prompt

1. User opens `/admin-vercel`, clicks **New session**, types "Add a Rust page",
   clicks **Generate**.
2. `useChat` POSTs `{ messages, threadId, runId }` to
   `/api/ai/vercel-sandbox` and opens an SSE stream.
3. `chat()` starts a run. `withPersistence` records the run/messages in Postgres;
   `withSandbox` boots (or reuses, per `reuse: "thread"`) a Vercel VM that has
   cloned the repo, installed Claude Code + `gh`, and run `npm install`.
4. `claudeCodeText` launches the `claude` CLI in that VM with the user's prompt
   and the standing instructions ("do the task, open a PR").
5. Claude Code edits files, runs `git push` and `gh pr create` using the injected
   `GH_TOKEN`; its streamed output flows back through SSE to the browser and is
   mirrored to a durable `memoryStream` + Postgres.
6. If the browser reloads, a GET reconnects and either resumes the live stream
   (`resumeServerSentEventsResponse`) or reconstructs the finished conversation
   (`reconstructChat`).
7. Later, **Delete** calls `deleteVercelSession`, which destroys the VM(s) for
   that thread.

---

## 10. Running it locally

From `package.json` scripts:
- `npm run dev` — Vite dev server on port 3000.
- `npm run build` / `npm run preview` — production build (Nitro Node server) and
  preview.
- `npm run generate-routes` — regenerate `src/routeTree.gen.ts`.
- `npm run pg` — run a local Postgres 18 in Docker (user/pass `docker`).
- `npm run db-pull` / `npm run db-push` — Drizzle Kit schema sync.
- `npm run format` — Prettier (`arrowParens: avoid`, `printWidth: 150`).

Required environment variables:
- `POSTGRES` — Postgres connection string (used by `db.ts` and `drizzle.config.ts`).
- `ANTHROPIC_API_KEY` — for Claude Code inside the sandbox.
- `GH_TOKEN` — for the agent to push branches and open PRs.
- `DAYTONA_API_KEY` — only for the Daytona route.
- Provider credentials (Vercel / Railway) as required by each sandbox provider.

---

## 11. Directory map

```
src/
├─ router.tsx                      Router factory (SSR + Query wired in)
├─ routeTree.gen.ts               Generated route tree (do not edit)
├─ styles.css                     Tailwind entry
├─ routes/
│  ├─ __root.tsx                  HTML shell, sidebar nav, devtools
│  ├─ index.tsx                   Home
│  ├─ cpp.tsx / javascript.tsx    Static content pages (agent's playground)
│  ├─ admin-vercel.tsx            Full chat UI (sessions, multi-agent) — Vercel
│  ├─ admin-railway.tsx           Chat UI — Railway
│  ├─ admin-daytona.tsx           Minimal chat UI — Daytona
│  └─ api/ai/
│     ├─ vercel-sandbox.ts        chat() pipeline + durable SSE — Vercel
│     ├─ railway-sandbox.ts       same — Railway
│     └─ daytona-sandbox.ts       simpler pipeline — Daytona
├─ lib/
│  ├─ vercel-sandbox.ts           defineSandbox(...) for Vercel
│  └─ railway-sandbox.ts          defineSandbox(...) for Railway
├─ drizzle/
│  ├─ db.ts                       Postgres + Drizzle client
│  ├─ schema.ts                   chat_threads/runs/interrupts/metadata
│  └─ chat-persistence.ts         @tanstack/ai-persistence backend over Drizzle
├─ server-functions/
│  ├─ readSessions.ts             Session list loader
│  ├─ deleteVercelSession.ts      Tear down Vercel VM(s) for a thread
│  └─ deleteRailwaySession.ts     Tear down Railway VM(s) for a thread
└─ integrations/tanstack-query/   QueryClient provider + devtools panel
```

---

## 12. Mental model in one paragraph

This is a thin, provider-agnostic control plane for coding agents. The browser
talks to a TanStack Start API route; that route runs `@tanstack/ai`'s `chat()`
with the Claude Code adapter wrapped in two middlewares — one that persists every
bit of run/message/interrupt state to Postgres (so conversations are durable and
resumable across server restarts) and one that executes the agent inside a fresh
cloud VM (Vercel, Railway, or Daytona) that has cloned this repo and is armed
with an Anthropic key and a GitHub token. The agent does the task and opens a PR;
tokens stream back over durable SSE. Everything else in the repo — the content
pages, the sidebar — is just a small, real codebase for the agent to work on.
