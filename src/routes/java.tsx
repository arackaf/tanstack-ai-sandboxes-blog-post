import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/java")({ component: Java });

function Java() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Java</h1>
      <p className="mt-4 text-lg">
        Java is a statically typed, object-oriented language that compiles to
        bytecode and runs on the Java Virtual Machine, giving it its famous
        "write once, run anywhere" portability. With automatic memory
        management and a vast ecosystem, it powers enterprise back ends, Android
        apps, big-data tooling, and large-scale distributed systems.
      </p>
    </div>
  );
}
