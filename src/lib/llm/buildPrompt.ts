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
Croise les extraits quand l'un définit l'annonce et qu'un autre définit la conséquence générale de sa réussite ou de son échec.
Commence par dire directement ce que le joueur doit faire, puis justifie la décision avec les conditions de la règle.
Si la question demande des options, énumère les actions normales et les annonces d'opportunité rendues possibles par la situation.
Si la condition n'est pas remplie, explique brièvement l'élément manquant, indique que l'annonce est perdue et donne la pénalité prévue par les extraits.
Ne recopie pas tous les extraits et ne réponds pas à propos de règles non demandées.
Si les extraits ne contiennent pas la réponse, réponds :
"Je ne trouve pas cette règle dans les règles actuelles."`;
}
