import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability
        and maintainability in large, long-lived systems. It emphasizes strong
        typing, modularity, and compile-time checks, with built-in support for
        concurrency and real-time programming. Ada is widely used in
        safety-critical and high-integrity domains such as avionics, rail,
        defense, and space, where correctness matters more than anything else.
      </p>
    </div>
  );
}
