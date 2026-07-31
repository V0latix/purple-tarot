import { RULE_ALIASES } from "@/lib/rules/aliases";
import type { RuleSection } from "@/lib/rules/types";
import {
  meaningfulTerms,
  normalizeText,
  slugifyTitle,
} from "@/lib/utils/normalize";

function keywordsFor(title: string, content: string): string[] {
  const normalizedTitle = normalizeText(title);
  const matchingAliases = Object.entries(RULE_ALIASES)
    .filter(([canonical]) => {
      const normalizedCanonical = normalizeText(canonical);
      return (
        normalizedTitle === normalizedCanonical ||
        normalizedTitle.includes(normalizedCanonical) ||
        normalizedCanonical.includes(normalizedTitle)
      );
    })
    .flatMap(([, aliases]) => aliases);

  return Array.from(
    new Set([
      ...meaningfulTerms(title),
      ...meaningfulTerms(content),
      ...matchingAliases.map(normalizeText),
    ]),
  );
}

export function parseMarkdownSections(markdown: string): RuleSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: RuleSection[] = [];
  const slugCounts = new Map<string, number>();
  let current: Omit<RuleSection, "id" | "keywords"> | null = null;

  const commit = () => {
    if (!current) return;

    const baseId = slugifyTitle(current.title);
    const occurrence = (slugCounts.get(baseId) ?? 0) + 1;
    slugCounts.set(baseId, occurrence);
    const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
    const content = current.content
      .trim()
      .replace(/\n?---\s*$/, "")
      .trim();

    sections.push({
      ...current,
      id,
      content,
      keywords: keywordsFor(current.title, content),
    });
  };

  for (const line of lines) {
    const heading = /^(#{2,3})\s+(.+?)\s*$/.exec(line);

    if (heading) {
      commit();
      current = {
        title: heading[2].replace(/\s+#+$/, "").trim(),
        level: heading[1].length,
        content: "",
      };
      continue;
    }

    if (current) {
      current.content += `${line}\n`;
    }
  }

  commit();
  return sections;
}

export function getMarkdownPreamble(markdown: string): string {
  const firstSection = markdown.search(/^##\s/m);
  return (firstSection === -1 ? markdown : markdown.slice(0, firstSection)).trim();
}

export { slugifyTitle };
