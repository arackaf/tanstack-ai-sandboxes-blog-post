import { useEffect, useRef, useState, type FC } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";

import { readSessions } from "../server-functions/readSessions";
import { deleteVercelSession } from "#/server-functions/deleteVercelSession";

export const Route = createFileRoute("/admin-vercel")({
  component: Admin,
  loader: () => readSessions(),
});

function Admin() {
  const [agentCounts, setAgentCounts] = useState<number>(0);
  const sessions = Route.useLoaderData();

  const [threadId, setThreadId] = useState<string>("");
  const [queryStringThreadId] = useState(() => {
    if (typeof window === "undefined") return "";

    const url = new URL(window.location.href);
    return url.searchParams.get("threadId") || "";
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function handleDelete(threadId: string) {
    deleteVercelSession({ data: { threadId } });
  }

  return (
    <div className="p-8 flex flex-col gap-2 max-w-2xl">
      <ul className="flex flex-col gap-2">
        {sessions.map(session => (
          <li key={session.threadId} className="flex items-center gap-4 rounded border border-gray-300 px-4 py-2">
            <span className="flex-1 truncate">{session.preview}</span>
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              onClick={() => setThreadId(session.threadId)}
            >
              Load
            </button>
            <button type="button" className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700" onClick={() => handleDelete(session.threadId)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {queryStringThreadId && isClient ? <AgentChat threadId={queryStringThreadId} /> : null}
      {threadId ? <AgentChat threadId={threadId} /> : null}
      {agentCounts === 0 ? (
        <button type="button" className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" onClick={() => setAgentCounts(cnt => cnt + 1)}>
          New session
        </button>
      ) : (
        Array.from({ length: agentCounts }, (_, idx) => idx)
          .reverse()
          .map(id => <AgentChat key={id} onStart={() => setAgentCounts(cnt => cnt + 1)} />)
      )}
    </div>
  );
}

type AgentChatProps = {
  onStart?: () => void;
  threadId?: string;
};
const AgentChat: FC<AgentChatProps> = props => {
  const { onStart, threadId: threadIdProp } = props;
  const started = useRef(false);
  const [threadId] = useState<string>(() => threadIdProp || uuidv4());

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents("/api/ai/vercel-sandbox"),
    threadId,
    persistence: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  function handleGenerate() {
    sendMessage(textareaRef.current?.value || "");

    if (!started.current) {
      onStart?.();
      started.current = true;
    }
  }

  return (
    <div className="p-8 flex flex-col gap-4">
      <label htmlFor="agent-prompt" className="block text-lg font-semibold">
        Spin off cloud agent {threadId}
      </label>
      <textarea ref={textareaRef} id="agent-prompt" rows={6} className="mt-2 block w-full max-w-2xl rounded border border-gray-300 p-2" />
      <button onClick={handleGenerate} type="button" className="mt-3 rounded bg-blue-600 max-w-2xl px-4 py-2 text-white hover:bg-blue-700">
        Generate
      </button>

      <div className="flex flex-col gap-4">
        {messages.map(message =>
          message.role === "user" ? (
            <div key={message.id} className="w-1/2 self-end rounded-2xl bg-blue-100 px-4 py-2">
              {message.parts.map((part, index) => (part.type === "text" ? <p key={index}>{part.content}</p> : null))}
            </div>
          ) : (
            <div key={message.id} className="w-full">
              {message.parts.map((part, index) => (part.type === "text" ? <p key={index}>{part.content}</p> : null))}
            </div>
          ),
        )}
        {isLoading && <Loader2 className="size-6 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
};
