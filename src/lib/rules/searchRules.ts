import { RULE_ALIASES } from "@/lib/rules/aliases";
import type {
  RuleSearchResult,
  RuleSection,
} from "@/lib/rules/types";
import { meaningfulTerms, normalizeText } from "@/lib/utils/normalize";

const MIN_RELEVANCE_SCORE = 6;

function includesPhrase(haystack: string, needle: string): boolean {
  return needle.length > 0 && (` ${haystack} `).includes(` ${needle} `);
}

function withoutLeadingArticle(value: string): string {
  return value.replace(/^(?:le|la|les|l)\s+/, "");
}

export function searchRules(
  sections: RuleSection[],
  question: string,
  limit = 5,
): RuleSearchResult[] {
  const normalizedQuestion = normalizeText(question);
  const questionTerms = meaningfulTerms(question);
  const meaningfulQuestion = questionTerms.join(" ");

  if (!normalizedQuestion || questionTerms.length === 0) return [];

  const matchedAliasGroups = Object.entries(RULE_ALIASES).filter(
    ([canonical, aliases]) => {
      const phrases = [canonical, ...aliases].map(normalizeText);
      return phrases.some((phrase) =>
        includesPhrase(normalizedQuestion, phrase),
      );
    },
  );

  return sections
    .map((section): RuleSearchResult => {
      const title = normalizeText(section.title);
      const content = normalizeText(section.content);
      const keywords = section.keywords.map(normalizeText);
      const matchedTerms = new Set<string>();
      let score = 0;

      if (
        withoutLeadingArticle(meaningfulQuestion) ===
        withoutLeadingArticle(title)
      ) {
        score += 18;
        matchedTerms.add(section.title);
      }

      for (const term of questionTerms) {
        if (title.split(" ").includes(term)) {
          score += 8;
          matchedTerms.add(term);
        } else if (keywords.some((keyword) => includesPhrase(keyword, term))) {
          score += 4;
          matchedTerms.add(term);
        } else if (content.split(" ").includes(term)) {
          score += 1;
          matchedTerms.add(term);
        }
      }

      for (const [canonical, aliases] of matchedAliasGroups) {
        const normalizedCanonical = normalizeText(canonical);
        const matchedAlias =
          [canonical, ...aliases]
            .map(normalizeText)
            .filter((alias) =>
              includesPhrase(normalizedQuestion, alias),
            )
            .sort(
              (a, b) =>
                b.split(" ").length - a.split(" ").length ||
                b.length - a.length,
            )[0] ?? normalizedCanonical;
        const sectionMatchesCanonical =
          withoutLeadingArticle(title) ===
          withoutLeadingArticle(normalizedCanonical);

        if (sectionMatchesCanonical) {
          score += 14 + matchedAlias.split(" ").length * 5;
          matchedTerms.add(matchedAlias);
        }
      }

      return {
        section,
        score,
        matchedTerms: [...matchedTerms],
      };
    })
    .filter((result) => result.score >= MIN_RELEVANCE_SCORE)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.section.level - b.section.level ||
        a.section.title.localeCompare(b.section.title, "fr"),
    )
    .slice(0, limit);
}
