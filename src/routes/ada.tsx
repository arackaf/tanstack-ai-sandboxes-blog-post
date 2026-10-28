import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability,
        safety, and maintainability in large, long-lived systems. It features
        strong typing, built-in concurrency (tasking), contracts, and a rich
        module system (packages). Named after Ada Lovelace, it's widely used in
        high-integrity domains like avionics, defense, railways, and other
        safety-critical software.
      </p>
    </div>
  );
}
