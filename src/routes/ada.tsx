import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ada")({ component: Ada });

function Ada() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ada</h1>
      <p className="mt-4 text-lg">
        Ada is a statically typed, compiled language designed for reliability, safety, and maintainability. Originally created for the US Department
        of Defense, it has strong typing, built-in concurrency (tasks), and a powerful contract and runtime-checking system. Ada is widely used in
        high-integrity domains like avionics, railways, spacecraft, and other safety-critical systems where correctness matters most.
      </p>
    </div>
  );
}
