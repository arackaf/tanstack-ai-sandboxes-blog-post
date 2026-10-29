import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for safety,
        reliability, and maintainability. Its strong typing, built-in
        concurrency through tasks, and contract-based programming make it a
        favorite for high-integrity systems where failure is not an option:
        avionics, rail signaling, spacecraft, and defense software. It is named
        after Ada Lovelace.
      </p>
    </div>
  );
}
