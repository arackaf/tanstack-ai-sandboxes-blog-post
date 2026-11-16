import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability and
        safety. Born out of a U.S. Department of Defense effort and named after
        Ada Lovelace, it emphasizes strong typing, modularity, and built-in
        concurrency. Its rigorous checks make it a mainstay in high-integrity
        domains like avionics, rail systems, spacecraft, and defense, where
        correctness matters more than anything.
      </p>
    </div>
  );
}
