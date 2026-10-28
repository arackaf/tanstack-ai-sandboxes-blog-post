import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { vercelGatewayText } from "@tanstack/ai-vercel-gateway";
import { defineSandbox, defineWorkspace, githubRepo, withSandbox } from "@tanstack/ai-sandbox";
import { vercelSandbox } from "@tanstack/ai-sandbox-vercel";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai/chat-streaming")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const repoSandbox = defineSandbox({
          id: "repo-agent",
          provider: vercelSandbox({
            projectId: "tanstack-ai-sandboxes-blog-post",
            teamId: "adam-rackis",
          }),
          workspace: defineWorkspace({
            source: githubRepo({ repo: "arackaf/tanstack-ai-sandboxes-blog-post" }),
            setup: ["npm install"],
          }),
        });

        const { messages, threadId } = await request.json();

        const stream = chat({
          adapter: vercelGatewayText("anthropic/claude-opus-5"),
          messages,
          threadId,
          middleware: [withSandbox(repoSandbox)],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});
