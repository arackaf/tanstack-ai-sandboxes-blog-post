import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/go")({ component: Go });

function Go() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Go</h1>
      <p className="mt-4 text-lg">
        Go is a statically typed, compiled language created at Google with a
        focus on simplicity, fast compilation, and built-in concurrency. Its
        goroutines and channels make concurrent programming approachable, while
        garbage collection and a small, readable syntax keep code easy to
        maintain. It's a popular choice for cloud infrastructure, networking
        services, CLIs, and backend systems.
      </p>
    </div>
  );
}
