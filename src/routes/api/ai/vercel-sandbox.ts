import { chatPersistence } from "#/drizzle/chat-persistence";
import { sandboxVercel } from "#/lib/vercel-sandbox";
import { chat, memoryStream, resumeServerSentEventsResponse, toServerSentEventsResponse } from "@tanstack/ai";
import { claudeCodeText } from "@tanstack/ai-claude-code";
import { reconstructChat, withPersistence } from "@tanstack/ai-persistence";
import { withSandbox } from "@tanstack/ai-sandbox";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai/vercel-sandbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const durability = memoryStream(request);
        if (durability.resumeFrom() !== null) {
          return resumeServerSentEventsResponse({ adapter: durability });
        }

        return reconstructChat(chatPersistence, request);
      },
      POST: async ({ request }) => {
        const { messages, threadId } = await request.json();

        const stream = chat({
          adapter: claudeCodeText("claude-opus-4-8"),
          messages,
          threadId,
          middleware: [withPersistence(chatPersistence), withSandbox(sandboxVercel)],
        });

        return toServerSentEventsResponse(stream, {
          durability: {
            adapter: memoryStream(request),
          },
        });
      },
    },
  },
});
