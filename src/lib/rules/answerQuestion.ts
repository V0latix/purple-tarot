import "server-only";

import { buildPrompt } from "@/lib/llm/buildPrompt";
import {
  buildContextualFallback,
  NOT_FOUND_ANSWER,
  validateModelAnswer,
} from "@/lib/llm/guardrails";
import { openRouterProvider } from "@/lib/llm/openRouterClient";
import type { LLMProvider } from "@/lib/llm/provider";
import { loadRules } from "@/lib/rules/loadRules";
import { searchRules } from "@/lib/rules/searchRules";
import type { AskResponse, RuleSection } from "@/lib/rules/types";
import { normalizeText } from "@/lib/utils/normalize";
import { PURPLE_SYSTEM_PROMPT } from "@/prompts/purple-system-prompt";

const STRONG_SOURCE_RATIO = 0.75;

type AnswerDependencies = {
  provider?: LLMProvider;
  sections?: RuleSection[];
};

export async function answerRuleQuestion(
  question: string,
  dependencies: AnswerDependencies = {},
): Promise<AskResponse> {
  const sections =
    dependencies.sections ?? (await loadRules()).sections;
  const candidates = searchRules(sections, question, 8).filter(
    (result) => result.section.content.trim().length > 0,
  );
  const bestScore = candidates[0]?.score ?? 0;
  const results = candidates
    .filter((result) => result.score >= bestScore * STRONG_SOURCE_RATIO)
    .slice(0, 3);
  let sources = results.map((result) => result.section);
  const primaryTitle = normalizeText(sources[0]?.title ?? "");

  if (primaryTitle.startsWith("purple ")) {
    const unrelatedColorSections = new Set(["rouge", "noir", "couleur"]);
    sources = sources.filter(
      (source, index) =>
        index === 0 || !unrelatedColorSections.has(normalizeText(source.title)),
    );

    const failureRule = sections.find(
      (section) => normalizeText(section.title) === "annonce",
    );
    if (
      failureRule &&
      !sources.some((source) => source.id === failureRule.id)
    ) {
      sources.push(failureRule);
    }
    sources = sources.slice(0, 3);
  }

  const serializedSources = sources.map(({ id, title, content }) => ({
    id,
    title,
    content,
  }));

  if (sources.length === 0) {
    return {
      answer: NOT_FOUND_ANSWER,
      sources: [],
      usedLLM: false,
      provider: "extractive",
    };
  }

  try {
    const provider = dependencies.provider ?? openRouterProvider;
    const result = await provider.ask([
      { role: "system", content: PURPLE_SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(question, sources) },
    ]);
    const validation = validateModelAnswer(
      result.content,
      sources,
      question,
    );

    if (!validation.valid || result.content === NOT_FOUND_ANSWER) {
      return {
        answer:
          result.content === NOT_FOUND_ANSWER
            ? NOT_FOUND_ANSWER
            : buildContextualFallback(question, sources),
        sources: serializedSources,
        usedLLM: result.content === NOT_FOUND_ANSWER,
        provider:
          result.content === NOT_FOUND_ANSWER
            ? "openrouter"
            : "extractive",
        model:
          result.content === NOT_FOUND_ANSWER
            ? result.model
            : undefined,
        error:
          result.content === NOT_FOUND_ANSWER
            ? undefined
            : "La réponse générée n’a pas passé les garde-fous.",
      };
    }

    return {
      answer: result.content,
      sources: serializedSources,
      usedLLM: true,
      provider: "openrouter",
      model: result.model,
    };
  } catch {
    return {
      answer: buildContextualFallback(question, sources),
      sources: serializedSources,
      usedLLM: false,
      provider: "extractive",
      error: "Le service IA est indisponible ; une réponse fondée sur les règles est affichée.",
    };
  }
}
