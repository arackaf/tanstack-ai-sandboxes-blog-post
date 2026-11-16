import { createFileRoute } from "@tanstack/react-router";

import { proxyToSandboxRequest } from "#/durable-objects/SandboxRequest/proxy";

export const Route = createFileRoute("/api/ai/vercel-sandbox")({
  server: {
    handlers: {
      GET: ({ request }) => proxyToSandboxRequest(request, "/vercel-request"),
      POST: ({ request }) => proxyToSandboxRequest(request, "/vercel-request"),
    },
  },
});
