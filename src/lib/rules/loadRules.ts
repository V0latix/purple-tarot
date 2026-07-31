import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  getMarkdownPreamble,
  parseMarkdownSections,
} from "@/lib/rules/parseMarkdownSections";

const RULES_PATH = path.join(
  process.cwd(),
  "src/content/rules/purple-tarot-2.md",
);

export async function loadRules() {
  const markdown = await readFile(RULES_PATH, "utf8");

  return {
    markdown,
    preamble: getMarkdownPreamble(markdown),
    sections: parseMarkdownSections(markdown),
  };
}
