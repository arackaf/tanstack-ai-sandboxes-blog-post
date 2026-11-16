import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for safety,
        reliability, and maintainability in large, long-lived systems. It
        features strong typing, built-in support for concurrency through tasks,
        and contract-based programming, which lets the compiler and runtime
        catch many errors early. It's widely used in high-integrity domains like
        avionics, rail, defense, and other safety-critical embedded systems.
      </p>
    </div>
  );
}
