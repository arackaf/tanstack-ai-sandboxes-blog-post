import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/go")({ component: Go });

function Go() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Go</h1>
      <p className="mt-4 text-lg">
        Go is a statically typed, compiled, garbage-collected language created at
        Google with an emphasis on simplicity and readability. It's known for its
        fast builds, a powerful standard library, and first-class concurrency
        built around lightweight goroutines and channels. Go is widely used for
        cloud infrastructure, networking services, command-line tools, and
        backend systems.
      </p>
    </div>
  );
}
