import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/swift")({ component: Swift });

function Swift() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Swift</h1>
      <p className="mt-4 text-lg">
        Swift is a statically typed, compiled language created by Apple as a
        modern, safer successor to Objective-C. It combines expressive syntax
        with features like optionals, value types, and automatic reference
        counting to prevent common bugs. It's the primary language for building
        iOS, macOS, watchOS, and tvOS apps, and is increasingly used
        server-side.
      </p>
    </div>
  );
}
