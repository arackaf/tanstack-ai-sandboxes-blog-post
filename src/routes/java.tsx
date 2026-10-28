import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/java")({ component: Java });

function Java() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Java</h1>
      <p className="mt-4 text-lg">
        Java is a statically typed, object-oriented language that compiles to
        bytecode and runs on the Java Virtual Machine (JVM), giving it strong
        cross-platform portability. With automatic garbage collection, a vast
        standard library, and a mature ecosystem, it powers everything from
        enterprise back ends and Android apps to big data systems like Hadoop
        and Spark.
      </p>
    </div>
  );
}
