import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { claudeCodeText } from "@tanstack/ai-claude-code";
import { createSecrets, defineSandbox, defineWorkspace, githubRepo, withSandbox } from "@tanstack/ai-sandbox";
import { vercelSandbox } from "@tanstack/ai-sandbox-vercel";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai/chat-streaming")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const repoSandbox = defineSandbox({
          id: "repo-agent",
          provider: vercelSandbox({}),
          workspace: defineWorkspace({
            source: githubRepo({ repo: "arackaf/tanstack-ai-sandboxes-blog-post" }),
            setup: ["npm install", "sudo npm install -g @anthropic-ai/claude-code", "npm install"],
            secrets: createSecrets({
              ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
              GH_TOKEN: process.env.GH_TOKEN ?? "",
            }),
          }),
          lifecycle: { reuse: "thread" },
        });

        const { messages, threadId } = await request.json();

        const stream = chat({
          adapter: claudeCodeText("claude-opus-4-8"),
          messages,
          threadId,
          middleware: [withSandbox(repoSandbox)],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});
