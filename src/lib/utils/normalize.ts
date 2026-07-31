const APOSTROPHES = /['’‘`´]/g;

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(APOSTROPHES, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugifyTitle(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-");
}

export function meaningfulTerms(value: string): string[] {
  const stopWords = new Set([
    "a",
    "alors",
    "au",
    "aux",
    "avec",
    "avoir",
    "c",
    "ca",
    "ce",
    "ces",
    "cet",
    "cette",
    "comment",
    "dans",
    "de",
    "du",
    "des",
    "elle",
    "en",
    "est",
    "et",
    "fait",
    "faire",
    "il",
    "ils",
    "je",
    "l",
    "la",
    "le",
    "les",
    "leur",
    "lui",
    "mais",
    "ne",
    "on",
    "ou",
    "pas",
    "peut",
    "pour",
    "qu",
    "que",
    "quel",
    "quelle",
    "quoi",
    "se",
    "son",
    "sa",
    "ses",
    "si",
    "sur",
    "tu",
    "une",
    "un",
    "y",
  ]);

  return normalizeText(value)
    .split(" ")
    .filter((term) => (term.length > 1 || /^\d+$/.test(term)) && !stopWords.has(term));
}
