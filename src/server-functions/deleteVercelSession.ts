import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "../drizzle/db";
import { chatRuns } from "../drizzle/schema";
import { sandboxVercel } from "#/lib/vercel-sandbox";

export const deleteVercelSession = createServerFn({ method: "POST" })
  .validator((data: { threadId: string }) => data)
  .handler(async ({ data }) => {
    const { threadId } = data;
    const runs = await db
      .select({ runId: chatRuns.runId })
      .from(chatRuns)
      .where(eq(chatRuns.threadId, data.threadId));

    for (const run of runs) {
      console.log({ runId: run.runId, threadId });
      try {
        console.log("Deleting ...");
        await sandboxVercel.destroy({ runId: run.runId, threadId });
        console.log("Deleted");
      } catch (error) {
        console.log("error deleting vercel sandbox\n\n", error);
      }
    }
  });
