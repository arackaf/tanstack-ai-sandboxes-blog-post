import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kotlin")({ component: Kotlin });

function Kotlin() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Kotlin</h1>
      <p className="mt-4 text-lg">
        Kotlin is a statically typed, JVM-based language from JetBrains designed
        to be a more concise and safer alternative to Java. It features null
        safety baked into the type system, concise syntax, coroutines for
        structured concurrency, and seamless Java interoperability. It's the
        preferred language for Android development and also targets the server,
        the browser, and native binaries via Kotlin Multiplatform.
      </p>
    </div>
  );
}
