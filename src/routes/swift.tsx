import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/swift")({ component: Swift });

function Swift() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Swift</h1>
      <p className="mt-4 text-lg">
        Swift is a statically typed, compiled language created by Apple as a
        modern successor to Objective-C. It pairs a concise, expressive syntax
        with strong safety guarantees like optionals and automatic reference
        counting, helping you catch mistakes at compile time. It's the primary
        language for building apps across Apple's platforms, and it also runs
        on the server and Linux.
      </p>
    </div>
  );
}
