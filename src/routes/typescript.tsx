import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/typescript")({ component: TypeScript });

function TypeScript() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">TypeScript</h1>
      <p className="mt-4 text-lg">
        TypeScript is a statically typed superset of JavaScript that compiles
        down to plain JavaScript. It adds an optional, structural type system on
        top of the language, catching errors at build time and powering rich
        editor tooling like autocomplete and safe refactoring. It runs anywhere
        JavaScript does and has become the default choice for building large,
        maintainable web and server applications.
      </p>
    </div>
  );
}
