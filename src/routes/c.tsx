import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/c")({ component: C });

function C() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">C</h1>
      <p className="mt-4 text-lg">
        C is a statically typed, compiled language designed for systems
        programming. It offers direct access to memory through pointers and maps
        closely to the underlying hardware, which makes it fast and predictable.
        Decades after its creation it remains the foundation of operating system
        kernels, embedded firmware, compilers, and countless libraries that
        other languages build upon.
      </p>
    </div>
  );
}
