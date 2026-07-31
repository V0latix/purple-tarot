"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { searchRules } from "@/lib/rules/searchRules";
import type { RuleSection } from "@/lib/rules/types";

type RulesSearchProps = {
  sections: RuleSection[];
  onSelect: (id: string) => void;
};

export function RulesSearch({ sections, onSelect }: RulesSearchProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => (query.trim() ? searchRules(sections, query, 6) : []),
    [query, sections],
  );

  return (
    <div className="rules-search">
      <label className="search-field">
        <span className="sr-only">Rechercher dans les règles</span>
        <Search aria-hidden="true" size={17} />
        <input
          type="search"
          placeholder="Rechercher une règle…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="clear-search"
            aria-label="Effacer la recherche"
            onClick={() => setQuery("")}
          >
            <X size={15} />
          </button>
        )}
      </label>

      {query.trim() && (
        <div className="search-results" role="listbox">
          {results.length > 0 ? (
            results.map(({ section }) => (
              <button
                type="button"
                key={section.id}
                role="option"
                aria-selected="false"
                onClick={() => {
                  onSelect(section.id);
                  setQuery("");
                }}
              >
                <span>{section.title}</span>
                <small>
                  {section.content.replace(/[*_#>-]/g, "").slice(0, 84)}
                  {section.content.length > 84 ? "…" : ""}
                </small>
              </button>
            ))
          ) : (
            <p className="search-empty">Aucune règle correspondante.</p>
          )}
        </div>
      )}
    </div>
  );
}
