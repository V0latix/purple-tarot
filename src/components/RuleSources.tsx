"use client";

import { ArrowUpRight, BookOpen } from "lucide-react";

import type { AskResponse } from "@/lib/rules/types";

type RuleSourcesProps = {
  sources: AskResponse["sources"];
  onSelect: (id: string) => void;
};

export function RuleSources({ sources, onSelect }: RuleSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="message-sources">
      <div className="sources-label">
        <BookOpen aria-hidden="true" size={13} />
        Sources utilisées
      </div>
      <div className="source-list">
        {sources.map((source) => (
          <button
            type="button"
            key={source.id}
            className="source-chip"
            onClick={() => onSelect(source.id)}
            title={`Voir la règle ${source.title}`}
          >
            <span>{source.title}</span>
            <ArrowUpRight aria-hidden="true" size={13} />
          </button>
        ))}
      </div>
    </div>
  );
}
