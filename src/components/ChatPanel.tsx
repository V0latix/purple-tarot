"use client";

import { ArrowUp, LoaderCircle, WandSparkles } from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { ChatMessage, type ChatItem } from "@/components/ChatMessage";
import type { AskResponse } from "@/lib/rules/types";

const QUICK_QUESTIONS = [
  "C’est quoi Purple Bout ?",
  "Que fait l’Excuse ?",
  "Comment marche le chien ?",
  "Quand dire Ça coupe ?",
];

const INITIAL_MESSAGE: ChatItem = {
  id: "welcome",
  role: "assistant",
  content:
    "Une règle te fait hésiter ? Pose ta question, je répondrai uniquement à partir du livret.",
};

type ChatPanelProps = {
  onSourceSelect: (id: string) => void;
};

export function ChatPanel({ onSourceSelect }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatItem[]>([INITIAL_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const ask = async (rawQuestion: string) => {
    const nextQuestion = rawQuestion.trim();
    if (nextQuestion.length < 2 || isLoading) return;

    const userMessage: ChatItem = {
      id: crypto.randomUUID(),
      role: "user",
      content: nextQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: nextQuestion }),
      });
      const payload = (await response.json()) as
        | AskResponse
        | { error?: string };

      if (!response.ok || !("answer" in payload)) {
        throw new Error(payload.error ?? "La requête a échoué.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.answer,
          result: payload,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Je n’arrive pas à consulter les règles pour le moment. Réessaie dans quelques secondes.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  return (
    <div className="chat-panel">
      <div className="chat-intro">
        <div>
          <span className="eyebrow">Assistant de table</span>
          <h2>Une question sur le pli&nbsp;?</h2>
        </div>
        <div className="ai-status" title="Recherche locale + OpenRouter">
          <span aria-hidden="true" />
          Source verrouillée
        </div>
      </div>

      <div className="quick-questions" aria-label="Questions rapides">
        {QUICK_QUESTIONS.map((item) => (
          <button
            type="button"
            key={item}
            disabled={isLoading}
            onClick={() => void ask(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        ref={messagesRef}
        className="messages"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onSourceSelect={onSourceSelect}
          />
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="assistant-avatar" aria-hidden="true">
              <WandSparkles size={15} />
            </div>
            <div className="typing-indicator" aria-label="Recherche en cours">
              <LoaderCircle size={15} className="spin" />
              Je vérifie le livret…
            </div>
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <label>
          <span className="sr-only">Ta question sur les règles</span>
          <input
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={400}
            placeholder="Ex. Que se passe-t-il avec le 21 ?"
            disabled={isLoading}
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || question.trim().length < 2}
          aria-label="Envoyer la question"
        >
          <ArrowUp size={19} strokeWidth={2.2} />
        </button>
      </form>
      <p className="composer-note">
        Les réponses proviennent uniquement du fichier de règles.
      </p>
    </div>
  );
}
