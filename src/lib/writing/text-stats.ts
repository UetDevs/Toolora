const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to", "for", "of", "as",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "with", "by", "from",
]);

export function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function countCharacters(text: string, includeSpaces = true) {
  return includeSpaces ? text.length : text.replace(/\s/g, "").length;
}

export function countSentences(text: string) {
  return splitSentences(text).length;
}

export function countParagraphs(text: string) {
  return text.trim() ? text.trim().split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
}

export function countSyllables(word: string) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const groups = clean.replace(/(?:e|es|ed)$/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups?.length ?? 1);
}

export function estimateReadingTime(text: string, wpm = 200) {
  return countWords(text) / wpm;
}

export function fleschReadingEase(text: string) {
  const words = countWords(text);
  const sentences = Math.max(countSentences(text), 1);
  const syllables = text
    .trim()
    .split(/\s+/)
    .reduce((sum, word) => sum + countSyllables(word), 0);
  if (!words) return 0;
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

export function fleschKincaidGrade(text: string) {
  const words = countWords(text);
  const sentences = Math.max(countSentences(text), 1);
  const syllables = text
    .trim()
    .split(/\s+/)
    .reduce((sum, word) => sum + countSyllables(word), 0);
  if (!words) return 0;
  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

export function readabilityLabel(score: number) {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

export function keywordSentences(text: string, take = 3) {
  const sentences = splitSentences(text);
  const freq = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z']+/g) ?? []) {
    if (STOP.has(word) || word.length < 4) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  const ranked = sentences
    .map((sentence, index) => {
      const words = sentence.toLowerCase().match(/[a-z']+/g) ?? [];
      const score = words.reduce((sum, word) => sum + (freq.get(word) ?? 0), 0) / Math.max(words.length, 1);
      return { sentence, index, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(take, sentences.length)))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);
  return ranked;
}

export function analyzeText(text: string) {
  const words = countWords(text);
  const sentences = countSentences(text);
  const ease = fleschReadingEase(text);
  return {
    words,
    characters: countCharacters(text),
    charactersNoSpaces: countCharacters(text, false),
    sentences,
    paragraphs: countParagraphs(text),
    readingMinutes: estimateReadingTime(text),
    avgWordsPerSentence: sentences ? words / sentences : 0,
    ease,
    grade: fleschKincaidGrade(text),
    easeLabel: readabilityLabel(ease),
  };
}
