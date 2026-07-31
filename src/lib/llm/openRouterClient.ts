import "server-only";

import { z } from "zod";

import type {
  LLMMessage,
  LLMProvider,
  LLMResult,
} from "@/lib/llm/provider";

const OpenRouterResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string(),
        }),
      }),
    )
    .min(1),
});

class OpenRouterRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof OpenRouterRequestError) {
    return (
      error.status === undefined ||
      error.status === 408 ||
      error.status === 409 ||
      error.status === 429 ||
      error.status >= 500
    );
  }
  return error instanceof TypeError;
}

async function requestOpenRouter(
  messages: LLMMessage[],
  signal: AbortSignal,
): Promise<LLMResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new OpenRouterRequestError("OPENROUTER_API_KEY is missing");
  }

  const baseUrl =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  const model =
    process.env.OPENROUTER_MODEL ??
    "nvidia/nemotron-3-ultra-550b-a55b:free";
  const siteUrl =
    process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000";
  const appName =
    process.env.OPENROUTER_APP_NAME ??
    "Purple Tarot Rules Assistant";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": appName,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1,
      max_tokens: 350,
    }),
    signal,
  });

  if (!response.ok) {
    throw new OpenRouterRequestError(
      `OpenRouter returned ${response.status}`,
      response.status,
    );
  }

  const parsed = OpenRouterResponseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new OpenRouterRequestError("Invalid OpenRouter response");
  }

  return {
    content: parsed.data.choices[0].message.content.trim(),
    model: parsed.data.model ?? model,
  };
}

export async function askOpenRouter(
  messages: LLMMessage[],
): Promise<LLMResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      return await requestOpenRouter(messages, controller.signal);
    } catch (error) {
      lastError = error;
      if (attempt > 0 || !shouldRetry(error)) throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

export const openRouterProvider: LLMProvider = {
  ask: askOpenRouter,
};
