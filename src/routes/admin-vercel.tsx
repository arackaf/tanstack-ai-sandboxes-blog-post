import { useRef, useState, type FC } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";

export const Route = createFileRoute("/admin-vercel")({ component: Admin });

function Admin() {
  const [agentCounts, setAgentCounts] = useState<number>(1);

  return (
    <div>
      {Array.from({ length: agentCounts }, (_, idx) => idx)
        .reverse()
        .map(id => (
          <AgentChat key={id} onStart={() => setAgentCounts(cnt => cnt + 1)} />
        ))}
    </div>
  );
}

type AgentChatProps = {
  onStart: () => void;
};
const AgentChat: FC<AgentChatProps> = props => {
  const { onStart } = props;
  const started = useRef(false);
  const [threadId] = useState<string>(() => uuidv4());

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents("/api/ai/vercel-sandbox"),
    threadId,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  function handleGenerate() {
    sendMessage(textareaRef.current?.value || "");

    if (!started.current) {
      onStart();
      started.current = true;
    }
  }

  return (
    <div className="p-8 flex flex-col gap-4">
      <label htmlFor="agent-prompt" className="block text-lg font-semibold">
        Spin off cloud agent
      </label>
      <textarea
        ref={textareaRef}
        id="agent-prompt"
        rows={6}
        className="mt-2 block w-full max-w-2xl rounded border border-gray-300 p-2"
      />
      <button
        onClick={handleGenerate}
        type="button"
        className="mt-3 rounded bg-blue-600 max-w-2xl px-4 py-2 text-white hover:bg-blue-700"
      >
        Generate
      </button>

      <div className="flex flex-col gap-4">
        {messages.map(message =>
          message.role === "user" ? (
            <div
              key={message.id}
              className="w-1/2 self-end rounded-2xl bg-blue-100 px-4 py-2"
            >
              {message.parts.map((part, index) =>
                part.type === "text" ? <p key={index}>{part.content}</p> : null,
              )}
            </div>
          ) : (
            <div key={message.id} className="w-full">
              {message.parts.map((part, index) =>
                part.type === "text" ? <p key={index}>{part.content}</p> : null,
              )}
            </div>
          ),
        )}
        {isLoading && (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
};
