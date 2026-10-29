import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { defineAIPersistence } from "@tanstack/ai-persistence";
import type { SQL } from "drizzle-orm";
import type { ChatPersistence, InterruptRecord, InterruptStore, MessageStore, MetadataStore, RunRecord, RunStore } from "@tanstack/ai-persistence";

import { db } from "./db";
import { chatInterrupts, chatMetadata, chatRuns, chatThreads } from "./schema";

type Db = typeof db;

// Records omit absent optionals so they compare cleanly against the reference
// in-memory backend.
function mapRun(row: typeof chatRuns.$inferSelect): RunRecord {
  return {
    runId: row.runId,
    threadId: row.threadId,
    status: row.status,
    startedAt: row.startedAt,
    ...(row.finishedAt != null ? { finishedAt: row.finishedAt } : {}),
    ...(row.error != null
      ? {
          error: {
            message: row.error,
            ...(row.errorCode != null ? { code: row.errorCode } : {}),
          },
        }
      : {}),
    ...(row.usageJson != null ? { usage: row.usageJson } : {}),
    ...(row.sandboxKey != null ? { sandboxKey: row.sandboxKey } : {}),
    ...(row.detachedSince != null ? { detachedSince: row.detachedSince } : {}),
    ...(row.cancelRequested != null ? { cancelRequested: row.cancelRequested } : {}),
    ...(row.driverEpoch != null ? { driverEpoch: row.driverEpoch } : {}),
    ...(row.parentRunId != null ? { parentRunId: row.parentRunId } : {}),
    ...(row.subagentRunId != null ? { subagentRunId: row.subagentRunId } : {}),
    ...(row.name != null ? { name: row.name } : {}),
  };
}

function mapInterrupt(row: typeof chatInterrupts.$inferSelect): InterruptRecord {
  return {
    interruptId: row.interruptId,
    runId: row.runId,
    threadId: row.threadId,
    status: row.status,
    requestedAt: row.requestedAt,
    payload: row.payloadJson,
    ...(row.resolvedAt != null ? { resolvedAt: row.resolvedAt } : {}),
    ...(row.responseJson != null ? { response: row.responseJson } : {}),
  };
}

function createMessageStore(db: Db): MessageStore {
  return {
    async loadThread(threadId) {
      const rows = await db.select({ messagesJson: chatThreads.messagesJson }).from(chatThreads).where(eq(chatThreads.threadId, threadId)).limit(1);
      // Unknown thread is [], never null.
      return rows[0]?.messagesJson ?? [];
    },
    // Full overwrite — `messages` is the complete authoritative transcript.
    async saveThread(threadId, messages) {
      const updatedAt = Date.now();
      await db
        .insert(chatThreads)
        .values({ threadId, messagesJson: messages, updatedAt })
        .onConflictDoUpdate({
          target: chatThreads.threadId,
          set: { messagesJson: messages, updatedAt },
        });
    },
  };
}

function createRunStore(db: Db): RunStore {
  async function get(runId: string) {
    const rows = await db.select().from(chatRuns).where(eq(chatRuns.runId, runId)).limit(1);
    const row = rows[0];
    return row ? mapRun(row) : null;
  }

  return {
    get,
    // Idempotent: an existing runId is returned untouched so resume and
    // double-submit are safe.
    async createOrResume(input) {
      const { runId, threadId, startedAt, status } = input;
      const existing = await get(runId);
      if (existing) return existing;

      const record = {
        runId,
        threadId,
        status: status ?? "running",
        startedAt,
        ...(input.parentRunId !== undefined ? { parentRunId: input.parentRunId } : {}),
        ...(input.subagentRunId !== undefined ? { subagentRunId: input.subagentRunId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
      } satisfies RunRecord;

      await db.insert(chatRuns).values(record).onConflictDoNothing({ target: chatRuns.runId });

      // Re-read rather than trusting the insert: a concurrent createOrResume
      // may have won the race, and that row is the authoritative one.
      return (await get(runId)) ?? record;
    },
    // Patching an unknown runId is a no-op: never throws, never inserts.
    async update(runId, patch) {
      const set: Partial<typeof chatRuns.$inferInsert> = {};
      if (patch.status !== undefined) set.status = patch.status;
      if (patch.finishedAt !== undefined) set.finishedAt = patch.finishedAt;
      // Both columns move together, so a later code-less failure cannot
      // leave a stale errorCode from an earlier one behind.
      if (patch.error !== undefined) {
        set.error = patch.error.message;
        set.errorCode = patch.error.code ?? null;
      }
      if (patch.usage !== undefined) set.usageJson = patch.usage;
      // `'field' in patch`, not `!== undefined`: an explicit undefined (e.g. a
      // reattach clearing detachedSince) must still write NULL.
      if ("sandboxKey" in patch) set.sandboxKey = patch.sandboxKey ?? null;
      if ("detachedSince" in patch) set.detachedSince = patch.detachedSince ?? null;
      if ("cancelRequested" in patch) set.cancelRequested = patch.cancelRequested ?? null;
      if ("driverEpoch" in patch) set.driverEpoch = patch.driverEpoch ?? null;
      if (Object.keys(set).length === 0) return;

      await db.update(chatRuns).set(set).where(eq(chatRuns.runId, runId));
    },
    async findActiveRun(threadId) {
      const rows = await db
        .select()
        .from(chatRuns)
        .where(and(eq(chatRuns.threadId, threadId), eq(chatRuns.status, "running")))
        .orderBy(desc(chatRuns.startedAt))
        .limit(1);
      const row = rows[0];
      return row ? mapRun(row) : null;
    },
    async listByThread(threadId) {
      const rows = await db.select().from(chatRuns).where(eq(chatRuns.threadId, threadId)).orderBy(asc(chatRuns.startedAt));
      return rows.map(mapRun);
    },
    async listByParentRun(parentRunId) {
      const rows = await db.select().from(chatRuns).where(eq(chatRuns.parentRunId, parentRunId)).orderBy(asc(chatRuns.startedAt));
      return rows.map(mapRun);
    },
    // Still-running runs detached at or before the (inclusive) cutoff.
    async listReclaimable({ now, ttlMs }) {
      const cutoff = now - ttlMs;
      const rows = await db
        .select()
        .from(chatRuns)
        .where(and(eq(chatRuns.status, "running"), isNotNull(chatRuns.detachedSince), lte(chatRuns.detachedSince, cutoff)));
      return rows.map(mapRun);
    },
  };
}

function createInterruptStore(db: Db): InterruptStore {
  // Every listing is ordered by requestedAt ascending.
  const listWhere = async (where: SQL | undefined) => {
    const rows = await db.select().from(chatInterrupts).where(where).orderBy(asc(chatInterrupts.requestedAt));
    return rows.map(mapInterrupt);
  };

  return {
    // Insert-if-absent: a duplicate create must never clobber a resolved
    // interrupt back to pending.
    async create(record) {
      await db
        .insert(chatInterrupts)
        .values({
          interruptId: record.interruptId,
          runId: record.runId,
          threadId: record.threadId,
          status: "pending",
          requestedAt: record.requestedAt,
          payloadJson: record.payload,
          ...(record.response !== undefined ? { responseJson: record.response } : {}),
        })
        .onConflictDoNothing({ target: chatInterrupts.interruptId });
    },
    async resolve(interruptId, response) {
      await db
        .update(chatInterrupts)
        .set({
          status: "resolved",
          resolvedAt: Date.now(),
          ...(response !== undefined ? { responseJson: response } : {}),
        })
        .where(eq(chatInterrupts.interruptId, interruptId));
    },
    async cancel(interruptId) {
      await db.update(chatInterrupts).set({ status: "cancelled", resolvedAt: Date.now() }).where(eq(chatInterrupts.interruptId, interruptId));
    },
    async get(interruptId) {
      const rows = await db.select().from(chatInterrupts).where(eq(chatInterrupts.interruptId, interruptId)).limit(1);
      const row = rows[0];
      return row ? mapInterrupt(row) : null;
    },
    list: (threadId) => listWhere(eq(chatInterrupts.threadId, threadId)),
    listPending: (threadId) => listWhere(and(eq(chatInterrupts.threadId, threadId), eq(chatInterrupts.status, "pending"))),
    listByRun: (runId) => listWhere(eq(chatInterrupts.runId, runId)),
    listPendingByRun: (runId) => listWhere(and(eq(chatInterrupts.runId, runId), eq(chatInterrupts.status, "pending"))),
  };
}

function createMetadataStore(db: Db): MetadataStore {
  return {
    async get(namespace, key) {
      const rows = await db
        .select({ valueJson: chatMetadata.valueJson })
        .from(chatMetadata)
        .where(and(eq(chatMetadata.namespace, namespace), eq(chatMetadata.key, key)))
        .limit(1);
      return rows[0]?.valueJson ?? null;
    },
    async set(namespace, key, value) {
      // JSON null would hit the NOT NULL constraint with an opaque driver error.
      if (value == null) {
        throw new TypeError(`Cannot store ${value} for (${namespace}, ${key}) — use delete() to clear metadata.`);
      }
      await db
        .insert(chatMetadata)
        .values({ namespace, key, valueJson: value })
        .onConflictDoUpdate({
          target: [chatMetadata.namespace, chatMetadata.key],
          set: { valueJson: value },
        });
    },
    async delete(namespace, key) {
      await db.delete(chatMetadata).where(and(eq(chatMetadata.namespace, namespace), eq(chatMetadata.key, key)));
    },
  };
}

/** The four chat state stores backed by the app's Drizzle database. */
export const chatPersistence: ChatPersistence = defineAIPersistence({
  stores: {
    messages: createMessageStore(db),
    runs: createRunStore(db),
    interrupts: createInterruptStore(db),
    metadata: createMetadataStore(db),
  },
});
