"use client";

import { Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { RuleSources } from "@/components/RuleSources";
import type { AskResponse } from "@/lib/rules/types";

export type ChatItem = {
  id: string;
  role: "assistant" | "user";
  content: string;
  result?: AskResponse;
};

type ChatMessageProps = {
  message: ChatItem;
  onSourceSelect: (id: string) => void;
};

export function ChatMessage({
  message,
  onSourceSelect,
}: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`chat-message ${message.role}`}>
      {isAssistant && (
        <div className="assistant-avatar" aria-hidden="true">
          <Bot size={16} />
        </div>
      )}
      <div className="message-body">
        <div className="message-bubble">
          {isAssistant ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        {message.result && (
          <>
            <div className="answer-meta">
              <Sparkles aria-hidden="true" size={12} />
              {message.result.usedLLM
                ? "Réponse assistée par IA"
                : "Extrait fiable des règles"}
            </div>
            <RuleSources
              sources={message.result.sources}
              onSelect={onSourceSelect}
            />
          </>
        )}
      </div>
    </div>
  );
}
