import { chat, memoryStream, resumeServerSentEventsResponse, toServerSentEventsResponse } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { withSandbox } from "@tanstack/ai-sandbox";
import { claudeCodeText } from "@tanstack/ai-claude-code";

import { sandboxRailway } from "#/lib/railway-sandbox";
import { chatPersistence } from "#/drizzle/chat-persistence";

import { reconstructChat, withPersistence } from "@tanstack/ai-persistence";

export const Route = createFileRoute("/api/ai/railway-sandbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const durability = memoryStream(request, { firstChunkDeadlineMs: 1000 * 5 });
        if (durability.resumeFrom() !== null) {
          return resumeServerSentEventsResponse({ adapter: durability });
        }

        return reconstructChat(chatPersistence, request);
      },
      POST: async ({ request }) => {
        const { messages, threadId, runId } = await request.json();

        const stream = chat({
          adapter: claudeCodeText("claude-opus-4-8"),
          messages,
          threadId,
          runId,
          middleware: [withPersistence(chatPersistence), withSandbox(sandboxRailway)],
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
