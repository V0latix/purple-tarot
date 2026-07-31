export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMResult = {
  content: string;
  model: string;
};

export type LLMProvider = {
  ask(messages: LLMMessage[]): Promise<LLMResult>;
};
