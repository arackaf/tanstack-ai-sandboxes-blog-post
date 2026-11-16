import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sql")({ component: Sql });

function Sql() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">SQL</h1>
      <p className="mt-4 text-lg">
        SQL (Structured Query Language) is a declarative language for defining
        and manipulating data in relational databases. Instead of spelling out
        how to fetch data, you describe what you want and the database's query
        planner figures out the rest. It powers querying, inserting, updating,
        and schema management across systems like PostgreSQL, MySQL, SQLite, and
        SQL Server, making it one of the most widely used languages in data
        analytics, backend development, and reporting.
      </p>
    </div>
  );
}
