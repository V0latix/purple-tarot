import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  buildExtractiveFallback,
  validateModelAnswer,
} from "@/lib/llm/guardrails";
import type { LLMProvider } from "@/lib/llm/provider";
import { answerRuleQuestion } from "@/lib/rules/answerQuestion";
import { parseMarkdownSections } from "@/lib/rules/parseMarkdownSections";
import type { RuleSection } from "@/lib/rules/types";

describe("garde-fous", () => {
  let sections: RuleSection[];
  let le21: RuleSection;

  beforeAll(() => {
    const markdown = readFileSync(
      path.join(
        process.cwd(),
        "src/content/rules/purple-tarot-2.md",
      ),
      "utf8",
    );
    sections = parseMarkdownSections(markdown);
    le21 = sections.find((section) => section.title === "Le 21")!;
  });

  it("refuse une réponse vide", () => {
    expect(validateModelAnswer("", [le21]).valid).toBe(false);
  });

  it("refuse une réponse sans source", () => {
    expect(
      validateModelAnswer("Le 21 distribue un cul sec.", []).valid,
    ).toBe(false);
  });

  it("refuse une mention du tarot classique", () => {
    expect(
      validateModelAnswer(
        "Au tarot classique, le 21 remporte le pli.",
        [le21],
      ).valid,
    ).toBe(false);
  });

  it("ne sollicite pas le provider pour une question inconnue", async () => {
    const ask = vi.fn();
    const provider: LLMProvider = { ask };
    const result = await answerRuleQuestion(
      "Est-ce que la Dame de cœur donne une pénalité ?",
      { provider, sections },
    );

    expect(result.answer).toBe(
      "Je ne trouve pas cette règle dans les règles actuelles.",
    );
    expect(ask).not.toHaveBeenCalled();
  });

  it("utilise le fallback extractif si OpenRouter échoue", async () => {
    const provider: LLMProvider = {
      ask: vi.fn().mockRejectedValue(new Error("indisponible")),
    };
    const result = await answerRuleQuestion("Que fait le 21 ?", {
      provider,
      sections,
    });

    expect(result.usedLLM).toBe(false);
    expect(result.provider).toBe("extractive");
    expect(result.answer).toBe(buildExtractiveFallback(le21));
  });
});
