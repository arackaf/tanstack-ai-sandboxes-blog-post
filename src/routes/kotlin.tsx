import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kotlin")({ component: Kotlin });

function Kotlin() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Kotlin</h1>
      <p className="mt-4 text-lg">
        Kotlin is a statically typed language that runs on the JVM and
        interoperates seamlessly with Java. It emphasizes concise, expressive
        syntax with features like null safety, data classes, extension
        functions, and coroutines for structured concurrency. It's the preferred
        language for Android development and also targets the server, the
        browser, and native platforms.
      </p>
    </div>
  );
}
