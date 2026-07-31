export function buildPrompt(
  question: string,
  rulebookMarkdown: string,
): string {
  return `Voici le livret complet et officiel de Purple Tarot.

<livret_regles>
${rulebookMarkdown}
</livret_regles>

<question_utilisateur>
${question}
</question_utilisateur>

Instruction :
- Retourne uniquement la réponse finale en français, sans raisonnement, analyse, brouillon ni préambule.
- Limite la réponse à 90 mots et 2 à 4 phrases courtes.
- Réponds uniquement à partir du livret complet ci-dessus.
- Cherche librement dans toutes les sections et croise toutes les règles pertinentes.
- Commence par la conséquence concrète pour le joueur, puis explique pourquoi.
- Distingue les annonces normales, les annonces d'opportunité et les effets déjà déclenchés.
- Si la question demande des options, présente toutes les options applicables à la situation.
- Reformule naturellement : ne recopie pas simplement une section du livret.
- N'ajoute aucune règle qui n'est pas écrite dans le livret.
- Si le livret ne contient réellement pas la réponse, réponds exactement :
"Je ne trouve pas cette règle dans les règles actuelles."`;
}
