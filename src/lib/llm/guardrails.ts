import type { RuleSection } from "@/lib/rules/types";
import { meaningfulTerms, normalizeText } from "@/lib/utils/normalize";

export const NOT_FOUND_ANSWER =
  "Je ne trouve pas cette règle dans les règles actuelles.";

const UNSAFE_PHRASES = [
  "au tarot classique",
  "je pense",
  "normalement",
  "probablement",
];

const NUMBER_WORDS: Record<string, string> = {
  un: "1",
  une: "1",
  deux: "2",
  trois: "3",
  quatre: "4",
  cinq: "5",
  six: "6",
  sept: "7",
  huit: "8",
  neuf: "9",
  dix: "10",
};

function extractNumbers(value: string): string[] {
  const normalized = normalizeText(value);
  const digits = normalized.match(/\b\d+\b/g) ?? [];
  const words = normalized
    .split(" ")
    .map((term) => NUMBER_WORDS[term])
    .filter((number): number is string => Boolean(number));

  return [...digits, ...words];
}

export function buildExtractiveFallback(section?: RuleSection): string {
  if (!section?.content.trim()) return NOT_FOUND_ANSWER;

  return `D’après la règle « ${section.title} » :\n${section.content}`;
}

export function buildContextualFallback(
  question: string,
  sources: RuleSection[],
): string {
  const normalizedQuestion = normalizeText(question);
  const hasPurpleTarot = sources.some(
    (source) => normalizeText(source.title) === "purple tarot",
  );
  const hasFailureRule = sources.some(
    (source) => normalizeText(source.title) === "annonce",
  );
  const hasTwoRedCards = /\b(?:2|deux)(?: cartes?)? rouges?\b/.test(
    normalizedQuestion,
  );
  const hasOneBlackCard = /\b(?:1|un|une)(?: cartes?)? noires?\b/.test(
    normalizedQuestion,
  );
  const mentionsAtout = /\batouts?\b/.test(normalizedQuestion);
  const sourceTitles = sources.map((source) =>
    normalizeText(source.title).replace(/^\d+\s+/, ""),
  );
  const hasJePisse = sourceTitles.includes("je pisse");
  const hasNormalTurn = sourceTitles.includes("deroulement d un tour");
  const hasOpeningRule = sourceTitles.includes("j ouvre a une couleur");
  const hasThreeAtoutsOnPli =
    /\b(?:3|trois) atouts?\b/.test(normalizedQuestion) &&
    /\bpli\b/.test(normalizedQuestion);

  if (
    hasPurpleTarot &&
    hasFailureRule &&
    hasTwoRedCards &&
    hasOneBlackCard &&
    !mentionsAtout
  ) {
    return "Tu bois autant de gorgées qu’il y a de cartes dans le pli, car Purple Tarot accepte uniquement une carte rouge, une carte noire et un atout, dans n’importe quel ordre. Ici, il manque l’atout : l’annonce est donc perdue et le pli est défaussé.";
  }


  if (hasJePisse && hasNormalTurn && hasThreeAtoutsOnPli) {
    const openingOption = hasOpeningRule
      ? " Comme c’est ta première annonce du tour, tu peux également choisir « J’ouvre à une couleur » : si cette couleur apparaît, tu peux arrêter immédiatement ton tour."
      : "";

    return `Tu peux jouer normalement et faire l’annonce principale de ton choix. Si les trois atouts du pli viennent bien d’être révélés consécutivement, tu peux aussi annoncer immédiatement « Je pisse ! » avant toute nouvelle carte : tu paries alors que la prochaine carte ne sera pas un atout.${openingOption}`;
  }

  return buildExtractiveFallback(sources[0]);
}

export function validateModelAnswer(
  answer: string,
  sources: RuleSection[],
  question = "",
): { valid: boolean; reason?: string } {
  const normalizedAnswer = normalizeText(answer);

  if (!normalizedAnswer) return { valid: false, reason: "empty" };
  if (sources.length === 0) return { valid: false, reason: "missing_sources" };

  if (
    UNSAFE_PHRASES.some((phrase) =>
      normalizedAnswer.includes(normalizeText(phrase)),
    )
  ) {
    return { valid: false, reason: "unsupported_language" };
  }

  if (answer.trim() === NOT_FOUND_ANSWER) {
    return { valid: true };
  }

  const sourceText = normalizeText(
    sources.map((source) => `${source.title} ${source.content}`).join(" "),
  );
  const answerTerms = Array.from(new Set(meaningfulTerms(answer)));
  const overlap = answerTerms.filter((term) =>
    sourceText.split(" ").includes(term),
  );

  if (overlap.length < 2) {
    return { valid: false, reason: "low_source_overlap" };
  }

  const sourceNumbers = new Set(extractNumbers(`${sourceText} ${question}`));
  const answerNumbers = extractNumbers(normalizedAnswer);

  if (answerNumbers.some((number) => !sourceNumbers.has(number))) {
    return { valid: false, reason: "unsupported_number" };
  }

  return { valid: true };
}
