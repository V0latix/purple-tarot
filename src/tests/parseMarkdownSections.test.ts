import { describe, expect, it } from "vitest";

import {
  parseMarkdownSections,
  slugifyTitle,
} from "@/lib/rules/parseMarkdownSections";

describe("slugifyTitle", () => {
  it.each([
    ["Ça coupe !", "ca-coupe"],
    ["L’Excuse", "l-excuse"],
    ["J’ouvre à une couleur", "j-ouvre-a-une-couleur"],
    ["Le 21", "le-21"],
  ])("transforme %s en %s", (title, expected) => {
    expect(slugifyTitle(title)).toBe(expected);
  });
});

describe("parseMarkdownSections", () => {
  it("indexe les titres de niveaux 2 et 3 et leur contenu", () => {
    const markdown = `# Règles

Introduction.

## Ça coupe !

Une règle de coupe.

### Détail

Un détail utile.
`;
    const sections = parseMarkdownSections(markdown);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      id: "ca-coupe",
      title: "Ça coupe !",
      level: 2,
      content: "Une règle de coupe.",
    });
    expect(sections[1]).toMatchObject({
      id: "detail",
      title: "Détail",
      level: 3,
      content: "Un détail utile.",
    });
  });

  it("rend les identifiants dupliqués uniques", () => {
    const sections = parseMarkdownSections(
      "## Purple\n\n### Purple\n\nTexte",
    );

    expect(sections.map((section) => section.id)).toEqual([
      "purple",
      "purple-2",
    ]);
  });
});
