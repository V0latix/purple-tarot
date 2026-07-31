import type { RuleSection } from "@/lib/rules/types";

export function buildPrompt(question: string, sections: RuleSection[]): string {
  const sources = sections
    .map(
      (section) => `[Source: ${section.title}]
${section.content}`,
    )
    .join("\n\n");

  return `Question utilisateur :
${question}

Extraits des règles :
${sources}

Instruction :
Réponds uniquement avec les extraits ci-dessus.
Si les extraits ne contiennent pas la réponse, réponds :
"Je ne trouve pas cette règle dans les règles actuelles."`;
}
