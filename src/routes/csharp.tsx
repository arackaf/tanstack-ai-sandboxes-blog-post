import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/csharp")({ component: CSharp });

function CSharp() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">C#</h1>
      <p className="mt-4 text-lg">
        C# is a statically typed, garbage-collected language developed by
        Microsoft for the .NET platform. It combines object-oriented and
        functional features with modern conveniences like async/await, LINQ, and
        pattern matching. It's widely used for building web services (ASP.NET),
        desktop apps, cloud back ends, and games with the Unity engine.
      </p>
    </div>
  );
}
