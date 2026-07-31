export type RuleSection = {
  id: string;
  title: string;
  level: number;
  content: string;
  keywords: string[];
};

export type RuleSearchResult = {
  section: RuleSection;
  score: number;
  matchedTerms: string[];
};

export type AskRequest = {
  question: string;
};

export type AskResponse = {
  answer: string;
  sources: {
    id: string;
    title: string;
    content: string;
  }[];
  usedLLM: boolean;
  provider: "openrouter" | "extractive";
  model?: string;
  error?: string;
};
