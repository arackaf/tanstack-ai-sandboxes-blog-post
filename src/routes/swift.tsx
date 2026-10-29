import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/swift")({ component: Swift });

function Swift() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Swift</h1>
      <p className="mt-4 text-lg">
        Swift is a statically typed, compiled language created by Apple as a
        modern successor to Objective-C. It emphasizes safety with features like
        optionals, value types, and automatic reference counting, while staying
        fast and expressive. It's the primary language for building apps across
        Apple's platforms (iOS, macOS, watchOS, and tvOS), and also runs on
        Linux and the server.
      </p>
    </div>
  );
}
