import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ruby")({ component: Ruby });

function Ruby() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Ruby</h1>
      <p className="mt-4 text-lg">
        Ruby is a dynamically typed, garbage-collected language designed for
        programmer happiness and productivity. It's purely object-oriented —
        everything is an object — with an expressive, readable syntax and
        powerful metaprogramming. It's widely used for web development, most
        notably through the Ruby on Rails framework, as well as scripting and
        automation.
      </p>
    </div>
  );
}
