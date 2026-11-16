import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/go")({ component: Go });

function Go() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Go</h1>
      <p className="mt-4 text-lg">
        Go is a statically typed, compiled language created at Google with a
        focus on simplicity and productivity. It pairs a small, easy-to-read
        syntax with fast builds, garbage collection, and first-class support for
        concurrency through goroutines and channels. It's a popular choice for
        cloud infrastructure, networking services, command-line tools, and
        backend APIs.
      </p>
    </div>
  );
}
