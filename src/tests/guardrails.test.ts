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

  it("accepte les nombres déjà présents dans la question", () => {
    expect(
      validateModelAnswer(
        "Avec ton 8, si tu remportes le pli avec le 21, tu distribues un cul sec.",
        [le21],
        "J’ai un 8 et je demande si la règle du 21 s’applique.",
      ).valid,
    ).toBe(true);
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

  it("associe l'ancien nom Purple tarot à la règle Purple Atout", async () => {
    const answer =
      "Le Purple tarot n’est pas validé : il manque un atout, donc son effet ne s’applique pas.";
    const ask = vi.fn().mockResolvedValue({
      content: answer,
      model: "test-model",
    });
    const provider: LLMProvider = { ask };
    const result = await answerRuleQuestion(
      "J’ai demandé un Purple tarot et j’ai eu un 8 de cœur, un 7 de trèfle et un cavalier de pique.",
      { provider, sections },
    );

    expect(result.answer).toBe(answer);
    expect(result.sources.map((source) => source.title)).toEqual([
      "Purple Atout",
    ]);
    expect(result.usedLLM).toBe(true);
    expect(ask).toHaveBeenCalledOnce();
  });
});
