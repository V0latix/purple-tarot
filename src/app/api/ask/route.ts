import { z } from "zod";

import { answerRuleQuestion } from "@/lib/rules/answerQuestion";

const AskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "La question est trop courte.")
    .max(400, "La question est trop longue."),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requête doit être au format JSON." },
      { status: 400 },
    );
  }

  const parsed = AskRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Question invalide." },
      { status: 400 },
    );
  }

  const response = await answerRuleQuestion(parsed.data.question);
  return Response.json(response);
}
