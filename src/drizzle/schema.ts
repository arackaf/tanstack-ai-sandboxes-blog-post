import { bigint, boolean, index, integer, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type { ModelMessage, TokenUsage } from "@tanstack/ai";
import type { InterruptRecord, RunStatus } from "@tanstack/ai-persistence";

export const chatThreads = pgTable(
  "chat_threads",
  {
    threadId: text("thread_id").primaryKey(),
    messagesJson: jsonb("messages_json").$type<Array<ModelMessage>>().notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    // look up thread, and also by last updated
    index("chat_threads_thread_id").on(table.threadId),
    index("chat_threads_updated_at").on(table.updatedAt),
  ],
);

export const chatRuns = pgTable(
  "chat_runs",
  {
    runId: text("run_id").primaryKey(),
    threadId: text("thread_id").notNull(),
    status: text("status").$type<RunStatus>().notNull(),
    startedAt: bigint("started_at", { mode: "number" }).notNull(),
    finishedAt: bigint("finished_at", { mode: "number" }),
    error: text("error"),
    errorCode: text("error_code"),
    usageJson: jsonb("usage_json").$type<TokenUsage>(),
    sandboxKey: text("sandbox_key"),
    detachedSince: bigint("detached_since", { mode: "number" }),
    cancelRequested: boolean("cancel_requested"),
    driverEpoch: integer("driver_epoch"),
    parentRunId: text("parent_run_id"),
    subagentRunId: text("subagent_run_id"),
    name: text("name"),
  },
  (table) => [
    index("chat_runs_status_detached").on(table.status, table.detachedSince),
    index("chat_runs_thread_started").on(table.threadId, table.startedAt),
    index("chat_runs_parent_started").on(table.parentRunId, table.startedAt),
  ],
);

export const chatInterrupts = pgTable("chat_interrupts", {
  interruptId: text("interrupt_id").primaryKey(),
  runId: text("run_id").notNull(),
  threadId: text("thread_id").notNull(),
  status: text("status").$type<InterruptRecord["status"]>().notNull(),
  requestedAt: bigint("requested_at", { mode: "number" }).notNull(),
  resolvedAt: bigint("resolved_at", { mode: "number" }),
  payloadJson: jsonb("payload_json").$type<Record<string, unknown>>().notNull(),
  responseJson: jsonb("response_json").$type<unknown>(),
});

export const chatMetadata = pgTable(
  "chat_metadata",
  {
    namespace: text("namespace").notNull(),
    key: text("key").notNull(),
    valueJson: jsonb("value_json").$type<unknown>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.namespace, table.key] })],
);
