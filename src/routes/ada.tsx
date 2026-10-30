import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for safety,
        reliability, and maintainability. It features strong typing, built-in
        concurrency through tasks, and contract-based programming with design by
        contract. Originally commissioned by the U.S. Department of Defense, it's
        widely used in high-integrity systems like avionics, railways, spacecraft,
        and other safety-critical software.
      </p>
    </div>
  );
}
