import { env } from "cloudflare:workers";

export function proxyToSandboxRequest(request: Request, path: "/railway-request" | "/vercel-request") {
  const stub = env.SANDBOX_REQUEST.get(env.SANDBOX_REQUEST.idFromName("user-123"));
  const url = new URL(request.url);
  url.pathname = path;
  return stub.fetch(new Request(url, request));
}
