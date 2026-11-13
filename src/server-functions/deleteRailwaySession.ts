import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { chatRuns, chatThreads } from "../drizzle/schema";
import { sandboxRailway } from "#/lib/railway-sandbox";

export const deleteRailwaySession = createServerFn({ method: "POST" })
  .validator((data: { threadId: string }) => data)
  .handler(async ({ data, context }) => {
    const { threadId } = data;
    const runs = await context.db.select({ runId: chatRuns.runId }).from(chatRuns).where(eq(chatRuns.threadId, threadId));

    try {
      console.log("Deleting ...");
      for (const run of runs) {
        await sandboxRailway.destroy({ runId: run.runId, threadId });
      }
      await context.db.delete(chatRuns).where(eq(chatRuns.threadId, threadId));
      await context.db.delete(chatThreads).where(eq(chatThreads.threadId, threadId));
      console.log("Deleted");
    } catch (error) {
      console.log("error deleting railway sandbox\n\n", error);
    }
  });
