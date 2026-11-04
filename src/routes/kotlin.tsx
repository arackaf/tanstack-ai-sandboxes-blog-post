import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kotlin")({ component: Kotlin });

function Kotlin() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Kotlin</h1>
      <p className="mt-4 text-lg">
        Kotlin is a statically typed, modern language that runs on the JVM and
        interoperates seamlessly with Java. Developed by JetBrains, it focuses on
        conciseness, null safety, and expressive syntax, cutting down the
        boilerplate common in Java. It's the preferred language for Android
        development and also targets the server, the browser (via Kotlin/JS), and
        native binaries (via Kotlin/Native).
      </p>
    </div>
  );
}
