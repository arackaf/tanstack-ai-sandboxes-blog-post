import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kotlin")({ component: Kotlin });

function Kotlin() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Kotlin</h1>
      <p className="mt-4 text-lg">
        Kotlin is a statically typed, concise language created by JetBrains that
        runs on the JVM and interoperates seamlessly with Java. It emphasizes
        null safety, expressive syntax, and features like coroutines for
        structured concurrency. Beyond the JVM, Kotlin targets Android (its
        officially preferred language), native binaries, and JavaScript.
      </p>
    </div>
  );
}
