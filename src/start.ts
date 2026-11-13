import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { Pool } from "pg";
import { getDb } from "./drizzle/db";

const globalContextMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const pool = new Pool({
      connectionString: env.HYPERDRIVE.connectionString,
    });

    const db = getDb(pool);

    return next({
      context: {
        db,
      },
    });
  } catch (error) {
    console.log({ msg: "Error in root context middleware", error });
    throw error;
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

export const errorLoggingMiddleware = createMiddleware({ type: "request" }).server(async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    console.error("REQUEST ERROR", dumpError(err));
    throw err;
  }
});

function dumpError(err: unknown): any {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: dumpError(err.cause),
      keys: Object.keys(err),
      raw: String(err),
    };
  }

  return err;
}

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, globalContextMiddleware, errorLoggingMiddleware],
  functionMiddleware: [],
}));
