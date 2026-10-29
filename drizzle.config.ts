import { defineConfig } from "drizzle-kit";

const connectionString = process.env.POSTGRES!;

console.log({ connectionString });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/drizzle/schema.ts",
  dbCredentials: {
    url: connectionString,
  },
  out: "./src/drizzle",
});
