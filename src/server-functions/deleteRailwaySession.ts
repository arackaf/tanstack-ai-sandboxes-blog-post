import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "../drizzle/db";
import { chatRuns, chatThreads } from "../drizzle/schema";
import { sandboxRailway } from "#/lib/railway-sandbox";

export const deleteRailwaySession = createServerFn({ method: "POST" })
  .validator((data: { threadId: string }) => data)
  .handler(async ({ data }) => {
    const { threadId } = data;
    const runs = await db.select({ runId: chatRuns.runId }).from(chatRuns).where(eq(chatRuns.threadId, threadId));

    try {
      console.log("Deleting ...");
      for (const run of runs) {
        await sandboxRailway.destroy({ runId: run.runId, threadId });
      }
      await db.delete(chatRuns).where(eq(chatRuns.threadId, threadId));
      await db.delete(chatThreads).where(eq(chatThreads.threadId, threadId));
      console.log("Deleted");
    } catch (error) {
      console.log("error deleting railway sandbox\n\n", error);
    }
  });
