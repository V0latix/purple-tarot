"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { RuleSection } from "@/lib/rules/types";

type RulesMarkdownProps = {
  preamble: string;
  sections: RuleSection[];
  highlightedId?: string;
};

export function RulesMarkdown({
  preamble,
  sections,
  highlightedId,
}: RulesMarkdownProps) {
  return (
    <article className="rules-document">
      <div className="rules-preamble">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{preamble}</ReactMarkdown>
      </div>

      {sections.map((section) => {
        const Heading = section.level === 2 ? "h2" : "h3";
        const isHighlighted = section.id === highlightedId;

        return (
          <section
            id={section.id}
            key={section.id}
            className={[
              "rule-section",
              `rule-level-${section.level}`,
              isHighlighted ? "is-highlighted" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Heading>
              {section.level === 3 && (
                <span className="heading-mark" aria-hidden="true">
                  ✦
                </span>
              )}
              {section.title}
            </Heading>
            {section.content && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.content}
              </ReactMarkdown>
            )}
          </section>
        );
      })}
    </article>
  );
}
