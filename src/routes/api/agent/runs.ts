import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/api/agent/runs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { threadId, messages } = await request.json() as any;

        // TODO: Authenticate the user.
        // TODO: Verify they own threadId.
        // TODO: Enforce concurrency / billing limits.

        const response = await env.AI_SANDBOX.fetch(
          new Request("https://edge-agent/runs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              threadId,
              messages,
            }),
          }),
        );

        // Forward the response, including { runId }.
        return response;
      },
    },
  },
});
