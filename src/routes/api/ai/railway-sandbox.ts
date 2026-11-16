import { createFileRoute } from "@tanstack/react-router";

import { proxyToSandboxRequest } from "#/durable-objects/SandboxRequest/proxy";

export const Route = createFileRoute("/api/ai/railway-sandbox")({
  server: {
    handlers: {
      GET: ({ request }) => proxyToSandboxRequest(request, "/railway-request"),
      POST: ({ request }) => proxyToSandboxRequest(request, "/railway-request"),
    },
  },
});
