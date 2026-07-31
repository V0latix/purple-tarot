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

export function buildExtractiveFallback(section?: RuleSection): string {
  if (!section) return NOT_FOUND_ANSWER;

  return `D’après la règle « ${section.title} » :\n${section.content}`;
}

export function validateModelAnswer(
  answer: string,
  sources: RuleSection[],
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

  const sourceNumbers = new Set(sourceText.match(/\b\d+\b/g) ?? []);
  const answerNumbers = normalizedAnswer.match(/\b\d+\b/g) ?? [];

  if (answerNumbers.some((number) => !sourceNumbers.has(number))) {
    return { valid: false, reason: "unsupported_number" };
  }

  return { valid: true };
}
