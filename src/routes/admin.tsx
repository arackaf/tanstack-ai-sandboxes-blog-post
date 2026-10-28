import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  return (
    <div className="p-8">
      <label htmlFor="agent-prompt" className="block text-lg font-semibold">
        Spin off cloud agent
      </label>
      <textarea
        id="agent-prompt"
        rows={6}
        className="mt-2 block w-full max-w-2xl rounded border border-gray-300 p-2"
      />
      <button
        type="button"
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Generate
      </button>
    </div>
  );
}
