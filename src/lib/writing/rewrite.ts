import { keywordSentences, splitSentences } from "./text-stats";

export const REWRITE_STYLES = [
  { id: "standard", label: "Standard" },
  { id: "simple", label: "Simple" },
  { id: "formal", label: "Formal" },
  { id: "academic", label: "Academic" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
] as const;

export type RewriteStyle = (typeof REWRITE_STYLES)[number]["id"];

const CONTRACTIONS: Record<string, string> = {
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "can't": "cannot",
  "won't": "will not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "haven't": "have not",
  "hasn't": "has not",
  "hadn't": "had not",
  "i'm": "I am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "it's": "it is",
  "that's": "that is",
  "there's": "there is",
  "let's": "let us",
  "i've": "I have",
  "we've": "we have",
  "they've": "they have",
  "i'll": "I will",
  "we'll": "we will",
  "they'll": "they will",
};

const FORMAL: Record<string, string> = {
  get: "obtain",
  got: "received",
  help: "assist",
  show: "demonstrate",
  use: "employ",
  make: "create",
  start: "begin",
  end: "conclude",
  big: "substantial",
  small: "modest",
  good: "effective",
  bad: "unsatisfactory",
  lots: "many",
  kids: "children",
  stuff: "material",
  thing: "matter",
  things: "matters",
  maybe: "perhaps",
  okay: "acceptable",
  really: "considerably",
  very: "highly",
  need: "require",
  ask: "request",
  tell: "inform",
  keep: "retain",
  find: "identify",
  look: "examine",
};

const SIMPLE: Record<string, string> = {
  obtain: "get",
  demonstrate: "show",
  utilize: "use",
  employ: "use",
  commence: "start",
  conclude: "end",
  substantial: "large",
  approximately: "about",
  subsequently: "then",
  therefore: "so",
  however: "but",
  additional: "more",
  assist: "help",
  require: "need",
  identify: "find",
  examine: "look at",
  considerably: "a lot",
  facilitate: "help",
  endeavor: "try",
};

const CREATIVE: Record<string, string> = {
  good: "compelling",
  bad: "troubling",
  important: "vital",
  interesting: "striking",
  said: "noted",
  show: "reveal",
  make: "shape",
  big: "sweeping",
  idea: "insight",
  problem: "challenge",
};

const PROFESSIONAL: Record<string, string> = {
  stuff: "work",
  things: "items",
  guys: "colleagues",
  ASAP: "promptly",
  kinda: "somewhat",
  gonna: "going to",
  wanna: "want to",
  fix: "resolve",
  issue: "matter",
};

function replaceWord(word: string, map: Record<string, string>) {
  const lower = word.toLowerCase();
  const next = map[lower];
  if (!next) return word;
  if (word[0] === word[0].toUpperCase()) {
    return next.charAt(0).toUpperCase() + next.slice(1);
  }
  return next;
}

function applyMap(text: string, map: Record<string, string>, intensity = 0.7) {
  return text.replace(/\b[A-Za-z']+\b/g, (word, offset) => {
    const seed = (word.length + offset) % 10;
    if (seed / 10 > intensity) return word;
    return replaceWord(word, map);
  });
}

function expandContractions(text: string) {
  return text.replace(/\b[A-Za-z']+\b/g, (word) => {
    const next = CONTRACTIONS[word.toLowerCase()];
    if (!next) return word;
    return word[0] === word[0].toUpperCase() ? next.charAt(0).toUpperCase() + next.slice(1) : next;
  });
}

function invertSentence(sentence: string) {
  const match = sentence.match(/^(.*?),\s+(and|but|so|because|although)\s+(.*)$/i);
  if (!match) return sentence;
  const [, left, link, right] = match;
  const cleanRight = right.replace(/[.?!]$/, "");
  return `${cleanRight.charAt(0).toUpperCase()}${cleanRight.slice(1)}, ${link.toLowerCase()} ${left.charAt(0).toLowerCase()}${left.slice(1)}`;
}

function splitLongSentence(sentence: string) {
  if (sentence.split(/\s+/).length < 22) return sentence;
  const parts = sentence.split(/,\s+(?:and|but|which|while)\s+/i);
  if (parts.length < 2) return sentence;
  return parts
    .map((part, index) => {
      const trimmed = part.replace(/[.?!]$/, "").trim();
      const ended = /[.?!]$/.test(part) ? part.trim() : `${trimmed}.`;
      if (index === 0) return ended;
      return ended.charAt(0).toUpperCase() + ended.slice(1);
    })
    .join(" ");
}

function styleOpeners(style: RewriteStyle) {
  if (style === "academic") return ["In this context,", "It is worth noting that", "This suggests that"];
  if (style === "professional") return ["In short,", "Practically speaking,", "The key point is that"];
  if (style === "creative") return ["Look closer:", "Here is the shift:", "Notice how"];
  if (style === "formal") return ["Accordingly,", "In summary,", "It remains clear that"];
  return [];
}

function polishSentence(sentence: string, style: RewriteStyle, index: number) {
  let next = sentence.trim();
  if (!next) return next;

  if (style === "simple") next = splitLongSentence(applyMap(next, SIMPLE, 1));
  if (style === "formal" || style === "academic") {
    next = expandContractions(applyMap(next, FORMAL, style === "academic" ? 0.85 : 0.7));
  }
  if (style === "professional") next = expandContractions(applyMap(next, { ...FORMAL, ...PROFESSIONAL }, 0.45));
  if (style === "creative") next = applyMap(next, { ...CREATIVE, help: "support", use: "draw on" }, 0.8);
  if (style === "standard") next = applyMap(next, { ...FORMAL, get: "gain", help: "support" }, 0.45);

  if (index % 2 === 1 && /,\s+(and|but|so|because)\s+/i.test(next)) {
    next = invertSentence(next);
  }

  const openers = styleOpeners(style);
  if (openers.length && index > 0 && index % 3 === 0 && !/^(In |It |This |Look |Here |Notice |Accordingly)/.test(next)) {
    next = `${openers[index % openers.length]} ${next.charAt(0).toLowerCase()}${next.slice(1)}`;
  }

  if (!/[.?!]$/.test(next)) next += ".";
  return next.replace(/\s+/g, " ");
}

export function rewriteText(text: string, style: RewriteStyle = "standard") {
  const source = text.trim();
  if (!source) return "";
  return splitSentences(source)
    .map((sentence, index) => polishSentence(sentence, style, index))
    .join(" ");
}

export function simplifyText(text: string) {
  return rewriteText(text, "simple");
}

export function formalizeText(text: string) {
  return rewriteText(text, "formal");
}

export function improveText(text: string) {
  const cleaned = applyLightGrammar(text);
  return rewriteText(cleaned, "professional");
}

export function summarizeText(text: string) {
  const sentences = splitSentences(text);
  if (sentences.length <= 2) return rewriteText(text, "simple");
  const take = Math.max(2, Math.ceil(sentences.length * 0.35));
  return keywordSentences(text, take).join(" ");
}

const IRREGULAR: Record<string, string> = {
  write: "written",
  make: "made",
  take: "taken",
  do: "done",
  go: "gone",
  see: "seen",
  find: "found",
  give: "given",
  keep: "kept",
  leave: "left",
  send: "sent",
  build: "built",
  buy: "bought",
  catch: "caught",
  teach: "taught",
  think: "thought",
  complete: "completed",
  finish: "finished",
  create: "created",
  review: "reviewed",
  publish: "published",
  submit: "submitted",
  prepare: "prepared",
  discuss: "discussed",
  analyze: "analyzed",
  update: "updated",
};

function participle(verb: string) {
  const lower = verb.toLowerCase();
  if (IRREGULAR[lower]) return IRREGULAR[lower];
  if (lower.endsWith("e")) return `${lower}d`;
  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) return `${lower.slice(0, -1)}ied`;
  return `${lower}ed`;
}

export function toPassive(text: string) {
  return splitSentences(text)
    .map((sentence) => {
      const match = sentence.match(/^(.+?)\s+([A-Za-z]+ed|[A-Za-z]+s|[A-Za-z]+)\s+(.+?)([.?!])?$/);
      if (!match) return sentence;
      const subject = match[1].trim();
      const verb = match[2].replace(/s$/, "");
      const object = match[3].replace(/[.?!]$/, "").trim();
      if (object.split(" ").length > 10 || /^(is|are|was|were|be)\b/i.test(match[2])) return sentence;
      return `${object.charAt(0).toUpperCase()}${object.slice(1)} was ${participle(verb)} by ${subject.charAt(0).toLowerCase()}${subject.slice(1)}.`;
    })
    .join(" ");
}

export function toActive(text: string) {
  return splitSentences(text)
    .map((sentence) => {
      const match = sentence.match(/^(.+?)\s+(?:was|were|is|are|been)\s+([A-Za-z]+ed|[A-Za-z]+en|[A-Za-z]+)\s+by\s+(.+?)([.?!])?$/i);
      if (!match) return sentence;
      const object = match[1].trim();
      const verb = match[2].replace(/ed$|en$/, "");
      const subject = match[3].replace(/[.?!]$/, "").trim();
      return `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${verb}${verb.endsWith("s") ? "" : "s"} ${object.charAt(0).toLowerCase()}${object.slice(1)}.`;
    })
    .join(" ");
}

export function applyLightGrammar(text: string) {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([.?!])([A-Za-z])/g, "$1 $2")
    .replace(/\bi\b/g, "I")
    .replace(/\balot\b/gi, "a lot")
    .replace(/\bteh\b/gi, "the")
    .replace(/\brecieve\b/gi, "receive")
    .replace(/\bseperate\b/gi, "separate")
    .replace(/\boccured\b/gi, "occurred")
    .replace(/\bdefinately\b/gi, "definitely")
    .replace(/\b(.+?)\b\s+\1\b/gi, "$1")
    .trim();
}

export type GrammarIssue = {
  id: string;
  message: string;
  excerpt: string;
};

export function findGrammarIssues(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  if (/\s{2,}/.test(text)) issues.push({ id: "spaces", message: "Extra spaces appear in the text.", excerpt: "double spaces" });
  if (/\balot\b/i.test(text)) issues.push({ id: "alot", message: "“alot” should be written as “a lot”.", excerpt: "alot" });
  if (/\bteh\b/i.test(text)) issues.push({ id: "teh", message: "Possible typo: “teh” → “the”.", excerpt: "teh" });
  if (/\brecieve\b/i.test(text)) issues.push({ id: "ie", message: "“recieve” is misspelled. Use “receive”.", excerpt: "recieve" });
  if (/\bseperate\b/i.test(text)) issues.push({ id: "sep", message: "“seperate” is misspelled. Use “separate”.", excerpt: "seperate" });
  if (/\bdefinately\b/i.test(text)) issues.push({ id: "def", message: "“definately” is misspelled. Use “definitely”.", excerpt: "definately" });
  if (/\boccured\b/i.test(text)) issues.push({ id: "occ", message: "“occured” is misspelled. Use “occurred”.", excerpt: "occured" });
  if (/(^|[.?!]\s+)[a-z]/.test(text)) issues.push({ id: "caps", message: "A sentence appears to start with a lowercase letter.", excerpt: "capitalization" });
  if (/\bi\b/.test(text)) issues.push({ id: "i", message: "The pronoun “I” should be capitalized.", excerpt: "i" });
  if (/\b(\w+)\s+\1\b/i.test(text)) issues.push({ id: "repeat", message: "A word is repeated twice in a row.", excerpt: "repeated word" });
  if (/[a-z],[A-Za-z]/.test(text)) issues.push({ id: "comma", message: "A comma is missing a space after it.", excerpt: "comma spacing" });
  const sentences = splitSentences(text);
  const long = sentences.filter((sentence) => sentence.split(/\s+/).length > 35);
  if (long.length) issues.push({ id: "long", message: `${long.length} sentence(s) are very long and may be hard to read.`, excerpt: "long sentence" });
  return issues;
}

export function convertCase(text: string, mode: "upper" | "lower" | "title" | "sentence" | "capitalize") {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "capitalize") {
    return text.replace(/\b([a-zA-Z])/g, (letter) => letter.toUpperCase());
  }
  if (mode === "title") {
    return text.toLowerCase().replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
  }
  return text
    .toLowerCase()
    .replace(/(^\s*[a-z])|([.?!]\s+[a-z])/g, (chunk) => chunk.toUpperCase());
}

export function removeDuplicateLines(text: string) {
  const seen = new Set<string>();
  return text
    .split(/\r?\n/)
    .filter((line) => {
      const key = line.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

export function reverseText(text: string, mode: "characters" | "words" | "lines") {
  if (mode === "lines") return text.split(/\r?\n/).reverse().join("\n");
  if (mode === "words") {
    return text
      .split(/\r?\n/)
      .map((line) => line.split(/\s+/).reverse().join(" "))
      .join("\n");
  }
  return [...text].reverse().join("");
}
