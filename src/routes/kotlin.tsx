import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kotlin")({ component: Kotlin });

function Kotlin() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Kotlin</h1>
      <p className="mt-4 text-lg">
        Kotlin is a statically typed, JVM-based language from JetBrains designed
        to be concise, safe, and fully interoperable with Java. Its type system
        guards against null-pointer errors, and features like coroutines,
        extension functions, and data classes cut down on boilerplate. It's the
        preferred language for Android development and also runs on the server,
        in the browser, and natively.
      </p>
    </div>
  );
}
