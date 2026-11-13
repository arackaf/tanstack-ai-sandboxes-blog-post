import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";
import type { ModelMessage } from "@tanstack/ai";

import { chatThreads } from "../drizzle/schema";

function messageText(content: ModelMessage["content"]): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter(part => part.type === "text")
      .map(part => part.content)
      .join(" ");
  }
  return "";
}

export const readSessions = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const rows = await context.db
    .select({ threadId: chatThreads.threadId, messagesJson: chatThreads.messagesJson })
    .from(chatThreads)
    .orderBy(desc(chatThreads.updatedAt))
    .limit(20);

  return rows.map(row => {
    const firstUserMessage = row.messagesJson.find(message => message.role === "user");

    return {
      threadId: row.threadId,
      preview: firstUserMessage ? messageText(firstUserMessage.content).slice(0, 50) : "",
    };
  });
});
