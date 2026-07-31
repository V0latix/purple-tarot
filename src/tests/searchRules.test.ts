import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { parseMarkdownSections } from "@/lib/rules/parseMarkdownSections";
import { searchRules } from "@/lib/rules/searchRules";
import type { RuleSection } from "@/lib/rules/types";

describe("searchRules", () => {
  let sections: RuleSection[];

  beforeAll(() => {
    const markdown = readFileSync(
      path.join(
        process.cwd(),
        "src/content/rules/purple-tarot-2.md",
      ),
      "utf8",
    );
    sections = parseMarkdownSections(markdown);
  });

  it.each([
    ["21", "Le 21"],
    ["vingt et un", "Le 21"],
    ["paquet sur la tête", "Défi du dealer"],
    ["5 atouts", "Double poignée"],
    ["6 cartes sans atout", "Misère d’atout"],
    ["merci paquet", "Le paquet"],
    [
      "J’ai demandé un Purple tarot avec un cœur et un trèfle",
      "Purple tarot",
    ],
  ])("associe « %s » à « %s »", (question, expectedTitle) => {
    const results = searchRules(sections, question);
    expect(results[0]?.section.title).toBe(expectedTitle);
  });

  it("refuse une règle absente du livret", () => {
    expect(
      searchRules(
        sections,
        "Est-ce que la Dame de cœur donne une pénalité ?",
      ),
    ).toEqual([]);
  });
});
