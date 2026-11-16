import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed with a strong
        emphasis on safety, reliability, and maintainability. Named after Ada
        Lovelace, it offers rich support for strong typing, modularity,
        concurrency through tasking, and contract-based programming. It's widely
        used in high-integrity domains like avionics, defense, rail, and other
        safety-critical systems where correctness matters most.
      </p>
    </div>
  );
}
