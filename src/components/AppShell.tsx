"use client";

import { BookOpenText, MessageCircleMore } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { ChatPanel } from "@/components/ChatPanel";
import { ResponsibleNotice } from "@/components/ResponsibleNotice";
import { RulesMarkdown } from "@/components/RulesMarkdown";
import { RulesSearch } from "@/components/RulesSearch";
import type { RuleSection } from "@/lib/rules/types";

type AppShellProps = {
  preamble: string;
  sections: RuleSection[];
};

export function AppShell({ preamble, sections }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "chat">("rules");
  const [highlightedId, setHighlightedId] = useState<string>();
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealRule = useCallback((id: string) => {
    setActiveTab("rules");
    setHighlightedId(id);

    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = setTimeout(
      () => setHighlightedId(undefined),
      3200,
    );
  }, []);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <div className="brand">
          <div className="brand-seal" aria-hidden="true">
            <span>♠</span>
          </div>
          <div>
            <h1>Purple Tarot</h1>
          </div>
        </div>
        <div className="suit-line" aria-label="Couleurs du tarot">
          <span className="red-suit">♥</span>
          <span>♣</span>
          <span className="red-suit">♦</span>
          <span>♠</span>
        </div>
        <ResponsibleNotice />
      </header>

      <nav className="mobile-tabs" aria-label="Sections de l’application">
        <button
          type="button"
          className={activeTab === "rules" ? "active" : ""}
          aria-pressed={activeTab === "rules"}
          onClick={() => setActiveTab("rules")}
        >
          <BookOpenText size={17} />
          Règles
        </button>
        <button
          type="button"
          className={activeTab === "chat" ? "active" : ""}
          aria-pressed={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        >
          <MessageCircleMore size={17} />
          Assistant
        </button>
      </nav>

      <div className="workspace">
        <section
          className={`rules-pane ${activeTab === "rules" ? "mobile-active" : ""}`}
          aria-label="Règles Purple Tarot"
        >
          <div className="pane-heading">
            <div>
              <span className="eyebrow">Source de vérité</span>
              <h2>Le livret des règles</h2>
            </div>
            <span className="rule-count">{sections.length} entrées</span>
          </div>
          <RulesSearch sections={sections} onSelect={revealRule} />
          <div className="rules-scroll">
            <RulesMarkdown
              preamble={preamble}
              sections={sections}
              highlightedId={highlightedId}
            />
          </div>
        </section>

        <section
          className={`chat-pane ${activeTab === "chat" ? "mobile-active" : ""}`}
          aria-label="Assistant des règles"
        >
          <ChatPanel onSourceSelect={revealRule} />
        </section>
      </div>
    </main>
  );
}
