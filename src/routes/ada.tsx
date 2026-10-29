import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for safety,
        reliability, and maintainability. It features strong typing, built-in
        concurrency through tasks, and contract-based programming with
        preconditions, postconditions, and type invariants. Named after Ada
        Lovelace, it's widely used in high-integrity domains like avionics, rail
        systems, defense, and other safety-critical software where correctness
        matters most.
      </p>
    </div>
  );
}
