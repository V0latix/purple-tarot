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
Analyse les cartes et les faits décrits dans la question, puis vérifie la condition de la règle la plus pertinente.
Si la condition n'est pas remplie, explique brièvement l'élément manquant et n'applique pas l'effet.
Ne recopie pas tous les extraits et ne réponds pas à propos de règles non demandées.
Si les extraits ne contiennent pas la réponse, réponds :
"Je ne trouve pas cette règle dans les règles actuelles."`;
}
