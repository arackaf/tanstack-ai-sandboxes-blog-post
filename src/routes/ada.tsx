import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability and
        maintainability in large, long-lived systems. It emphasizes strong
        typing, readability, and built-in support for concurrency and
        contract-based programming. With its emphasis on safety and rigorous
        compile-time checking, Ada is widely used in high-integrity domains like
        avionics, defense, rail, and space systems.
      </p>
    </div>
  );
}
