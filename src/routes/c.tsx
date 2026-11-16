import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/c")({ component: C });

function C() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">C</h1>
      <p className="mt-4 text-lg">
        C is a statically typed, compiled language designed for systems
        programming. It offers direct access to memory through pointers and maps
        closely to the underlying hardware while staying small and portable. As
        one of the most influential languages ever created, it underpins
        operating systems, compilers, embedded firmware, and the runtimes of
        countless other languages.
      </p>
    </div>
  );
}
