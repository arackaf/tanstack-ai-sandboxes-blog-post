import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rust")({ component: Rust });

function Rust() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Rust</h1>
      <p className="mt-4 text-lg">
        Rust is a statically typed, compiled language focused on performance and
        memory safety without a garbage collector. Its ownership and borrowing
        system guarantees memory and thread safety at compile time, eliminating
        whole classes of bugs. It's widely used for systems programming, command
        line tools, WebAssembly, embedded devices, and high-performance servers.
      </p>
    </div>
  );
}
