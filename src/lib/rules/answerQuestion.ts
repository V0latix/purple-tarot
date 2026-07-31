import "server-only";

import { buildPrompt } from "@/lib/llm/buildPrompt";
import {
  buildExtractiveFallback,
  NOT_FOUND_ANSWER,
  validateModelAnswer,
} from "@/lib/llm/guardrails";
import { openRouterProvider } from "@/lib/llm/openRouterClient";
import type { LLMProvider } from "@/lib/llm/provider";
import { loadRules } from "@/lib/rules/loadRules";
import { searchRules } from "@/lib/rules/searchRules";
import type { AskResponse, RuleSection } from "@/lib/rules/types";
import { PURPLE_SYSTEM_PROMPT } from "@/prompts/purple-system-prompt";

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
  const results = searchRules(sections, question, 4);
  const sources = results.map((result) => result.section);
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
    const validation = validateModelAnswer(result.content, sources);

    if (!validation.valid || result.content === NOT_FOUND_ANSWER) {
      return {
        answer:
          result.content === NOT_FOUND_ANSWER
            ? NOT_FOUND_ANSWER
            : buildExtractiveFallback(sources[0]),
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
      answer: buildExtractiveFallback(sources[0]),
      sources: serializedSources,
      usedLLM: false,
      provider: "extractive",
      error: "Le service IA est indisponible ; un extrait fiable est affiché.",
    };
  }
}
