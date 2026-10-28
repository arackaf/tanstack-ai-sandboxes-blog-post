import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cpp")({ component: Cpp });

function Cpp() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">C++</h1>
      <p className="mt-4 text-lg">
        C++ is a statically typed, compiled language that grew out of C. It
        gives you low-level control over memory and hardware while adding
        abstractions like classes, templates, and RAII. It's the go-to choice
        for performance-critical software: game engines, browsers, databases,
        operating systems, and embedded devices.
      </p>
    </div>
  );
}
