import { chatPersistence } from "#/drizzle/chat-persistence";
import { sandboxVercel } from "#/lib/vercel-sandbox";
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { claudeCodeText } from "@tanstack/ai-claude-code";
import { withPersistence } from "@tanstack/ai-persistence";
import { withSandbox } from "@tanstack/ai-sandbox";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai/vercel-sandbox")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = await request.json();

        const stream = chat({
          adapter: claudeCodeText("claude-opus-4-8"),
          messages,
          threadId,
          middleware: [withPersistence(chatPersistence), withSandbox(sandboxVercel)],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});
