import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/javascript")({ component: JavaScript });

function JavaScript() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">JavaScript</h1>
      <p className="mt-4 text-lg">
        JavaScript is a dynamically typed, garbage-collected language that
        started as the scripting language of the web browser. It's built around
        first-class functions and an event-driven, asynchronous model. Today it
        runs everywhere, from interactive front ends to servers (Node.js),
        tooling, and even desktop and mobile apps.
      </p>
    </div>
  );
}
