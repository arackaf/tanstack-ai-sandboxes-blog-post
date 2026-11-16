import { DurableObject } from "cloudflare:workers";
import { Pool } from "pg";
import { chat, memoryStream, resumeServerSentEventsResponse, toServerSentEventsResponse } from "@tanstack/ai";
import { claudeCodeText } from "@tanstack/ai-claude-code";
import { reconstructChat, withPersistence } from "@tanstack/ai-persistence";
import { withSandbox } from "@tanstack/ai-sandbox";

import { getDb } from "#/drizzle/db";
import { chatPersistence } from "#/drizzle/chat-persistence";
import { sandboxRailway } from "#/lib/railway-sandbox";
import { sandboxVercel } from "#/lib/vercel-sandbox";

const sandboxes = {
  "/railway-request": sandboxRailway,
  "/vercel-request": sandboxVercel,
} as const;

// TEMP DEBUG: changes if the DO's module state gets recreated
let isolateId: string | undefined;

export class SandboxRequest extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    const sandbox = sandboxes[pathname as keyof typeof sandboxes];
    if (!sandbox) {
      return new Response("Not found", { status: 404 });
    }

    isolateId ??= crypto.randomUUID().slice(0, 8);
    console.log("[SandboxRequest DEBUG]", {
      isolateId,
      method: request.method,
      url: request.url,
      lastEventId: request.headers.get("Last-Event-ID"),
      xRunId: request.headers.get("X-Run-Id"),
    });

    const db = getDb(new Pool({ connectionString: this.env.HYPERDRIVE.connectionString }));

    if (request.method === "GET") {
      const durability = memoryStream(request, { firstChunkDeadlineMs: 1000 * 5 });
      if (durability.resumeFrom() !== null) {
        return resumeServerSentEventsResponse({ adapter: durability });
      }

      return reconstructChat(chatPersistence(db), request);
    }

    if (request.method === "POST") {
      const { messages, threadId, runId } = (await request.json()) as any;

      const stream = chat({
        adapter: claudeCodeText("claude-opus-4-8"),
        messages,
        threadId,
        runId,
        middleware: [withPersistence(chatPersistence(db)), withSandbox(sandbox)],
      });

      return toServerSentEventsResponse(stream, {
        durability: {
          adapter: memoryStream(request),
        },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
