import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability
        and maintainability in large, long-lived systems. It emphasizes strong
        typing, modularity, and built-in support for concurrency and contracts,
        catching many errors at compile time. Ada is widely used in
        safety-critical domains like avionics, rail, defense, and spacecraft,
        where correctness really matters.
      </p>
    </div>
  );
}
