import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/api/agent/runs/$runId/stream")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const threadId = url.searchParams.get("threadId");

        if (!threadId) {
          return new Response("Missing threadId", { status: 400 });
        }

        // TODO: Authenticate user.
        // TODO: Verify ownership of threadId and runId.

        const upstream = new URL(`https://edge-agent/runs/${encodeURIComponent(params.runId)}/stream`);

        upstream.searchParams.set("threadId", threadId);
        upstream.searchParams.set("lastSeq", url.searchParams.get("lastSeq") ?? "-1");

        return env.AI_SANDBOX.fetch(
          new Request(upstream, {
            headers: {
              Upgrade: "websocket",
            },
          }),
        );
      },
    },
  },
});
