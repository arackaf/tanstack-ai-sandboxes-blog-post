import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability and maintainability in large, long-lived systems. It emphasizes strong
        typing, readable syntax, and built-in support for concurrency through tasks. With rich compile-time checks and features like contracts and the
        SPARK subset for formal verification, it's widely used in safety-critical domains such as avionics, rail, defense, and space.
      </p>
    </div>
  );
}
