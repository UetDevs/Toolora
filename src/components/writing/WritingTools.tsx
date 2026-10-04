"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Panel, PrimaryButton, ResultCard, SelectInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import {
  applyLightGrammar,
  convertCase,
  findGrammarIssues,
  formalizeText,
  improveText,
  removeDuplicateLines,
  reverseText,
  REWRITE_STYLES,
  rewriteText,
  simplifyText,
  summarizeText,
  toActive,
  toPassive,
  type RewriteStyle,
} from "@/lib/writing/rewrite";
import { analyzeText, countWords } from "@/lib/writing/text-stats";

const LIMIT = 8000;

const ETHICS =
  "Use this on text you wrote. Do not paste someone else’s essay and submit the rewrite as yours.";

function TextArea({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <textarea
      value={value}
      readOnly={readOnly}
      onChange={onChange ? (event) => onChange(event.target.value.slice(0, LIMIT)) : undefined}
      placeholder={placeholder}
      className="min-h-56 w-full resize-y rounded-lg border border-line bg-white px-3.5 py-3 text-sm leading-6 text-ink outline-none ring-brand/15 placeholder:text-subtle focus:border-brand focus:ring-4"
    />
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand disabled:opacity-40"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function StylePills({
  value,
  onChange,
}: {
  value: RewriteStyle;
  onChange: (value: RewriteStyle) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {REWRITE_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            value === style.id ? "bg-brand text-white" : "bg-slate-100 text-muted hover:bg-slate-200"
          }`}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}

function RewriteWorkspace({
  tool,
  actionLabel,
  transform,
  showStyles = false,
  defaultStyle = "standard",
  note,
}: {
  tool: Tool;
  actionLabel: string;
  transform: (text: string, style: RewriteStyle) => string;
  showStyles?: boolean;
  defaultStyle?: RewriteStyle;
  note?: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [style, setStyle] = useState<RewriteStyle>(defaultStyle);

  function run() {
    setOutput(transform(input, style));
  }

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          Paste a draft you wrote, choose a style if available, then review the suggestion before you use it.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your text">
          <TextArea
            value={input}
            onChange={setInput}
            placeholder="Paste your own draft here. Keep this under 8,000 characters."
          />
          <p className="mt-2 text-xs text-subtle">{countWords(input)} words · {input.length}/{LIMIT} characters</p>
          {showStyles ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-ink">Rewrite style</p>
              <StylePills value={style} onChange={setStyle} />
            </div>
          ) : null}
          <PrimaryButton className="mt-4" onClick={run} disabled={!input.trim()}>
            {actionLabel}
          </PrimaryButton>
        </Panel>
        <Panel title="Suggested edit" action={<CopyButton text={output} />}>
          <TextArea
            value={output}
            readOnly
            placeholder="Your edited version will appear here."
          />
          <p className="mt-3 text-xs leading-5 text-subtle">{note ?? ETHICS}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ParaphrasingTool({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Rewrite text"
      showStyles
      transform={(text, style) => rewriteText(text, style)}
    />
  );
}

export function SentenceRewriter({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Rewrite sentences"
      showStyles
      transform={(text, style) => rewriteText(text, style)}
    />
  );
}

export function ParagraphRewriter({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Rewrite paragraphs"
      showStyles
      transform={(text, style) =>
        text
          .split(/\n\s*\n/)
          .map((paragraph) => rewriteText(paragraph, style))
          .join("\n\n")
      }
    />
  );
}

export function TextRewriter({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Rewrite"
      showStyles
      transform={(text, style) => rewriteText(text, style)}
    />
  );
}

export function SentenceSimplifier({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Simplify sentences"
      defaultStyle="simple"
      transform={(text) => simplifyText(text)}
    />
  );
}

export function TextImprover({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Improve writing"
      defaultStyle="professional"
      transform={(text) => improveText(text)}
    />
  );
}

export function FormalWritingConverter({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Make it formal"
      defaultStyle="formal"
      transform={(text) => formalizeText(text)}
    />
  );
}

export function ActiveToPassive({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Convert to passive voice"
      transform={(text) => toPassive(text)}
      note="Works best on short subject-verb-object sentences, such as “The team finished the report.”"
    />
  );
}

export function PassiveToActive({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Convert to active voice"
      transform={(text) => toActive(text)}
      note="Looks for patterns like “The report was finished by the team.” Complex sentences may need a manual edit."
    />
  );
}

export function Summarizer({ tool }: { tool: Tool }) {
  return (
    <RewriteWorkspace
      tool={tool}
      actionLabel="Summarize"
      transform={(text) => summarizeText(text)}
      note="This extractive summary keeps the most informative sentences. It is a reading aid, not a substitute for the original source."
    />
  );
}

export function GrammarChecker({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Teh report is  alot better now, and I recieve feedback every week.");
  const [fixed, setFixed] = useState("");
  const issues = useMemo(() => findGrammarIssues(input), [input]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Check this draft">
          <TextArea value={input} onChange={setInput} />
          <PrimaryButton
            className="mt-4"
            onClick={() => setFixed(applyLightGrammar(input))}
            disabled={!input.trim()}
          >
            Fix common issues
          </PrimaryButton>
        </Panel>
        <Panel title={issues.length ? `${issues.length} issue${issues.length === 1 ? "" : "s"} found` : "Looks clean"}>
          {issues.length ? (
            <ul className="space-y-2 text-sm text-muted">
              {issues.map((issue) => (
                <li key={issue.id} className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No common spelling or spacing issues were detected.</p>
          )}
          {fixed ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Suggested cleanup</p>
                <CopyButton text={fixed} />
              </div>
              <TextArea value={fixed} readOnly />
            </div>
          ) : null}
          <p className="mt-3 text-xs text-subtle">
            This checker catches frequent typos and spacing mistakes. It is not a full proofreader.
          </p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function WordCounter({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Toolora helps you edit your own writing with clear, free browser tools.");
  const stats = analyzeText(input);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your text">
          <TextArea value={input} onChange={setInput} />
        </Panel>
        <ResultCard title="Words" value={String(stats.words)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Characters" value={String(stats.characters)} />
            <Stat label="Without spaces" value={String(stats.charactersNoSpaces)} />
            <Stat label="Sentences" value={String(stats.sentences)} />
            <Stat label="Reading time" value={`${formatNumber(stats.readingMinutes, 1)} min`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function CharacterCounter({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Count every character, including spaces and line breaks.");
  const stats = analyzeText(input);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your text">
          <TextArea value={input} onChange={setInput} />
        </Panel>
        <ResultCard title="Characters" value={String(stats.characters)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Without spaces" value={String(stats.charactersNoSpaces)} />
            <Stat label="Words" value={String(stats.words)} />
            <Stat label="Paragraphs" value={String(stats.paragraphs)} />
            <Stat label="Sentences" value={String(stats.sentences)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function CaseConverter({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Convert this sentence to any letter case you need.");
  const [mode, setMode] = useState<"sentence" | "title" | "upper" | "lower" | "capitalize">("title");
  const output = convertCase(input, mode);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Original">
          <TextArea value={input} onChange={setInput} />
          <div className="mt-4">
            <SelectInput value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
              <option value="sentence">Sentence case</option>
              <option value="title">Title Case</option>
              <option value="capitalize">Capitalize Words</option>
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
            </SelectInput>
          </div>
        </Panel>
        <Panel title="Converted" action={<CopyButton text={output} />}>
          <TextArea value={output} readOnly />
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function RemoveDuplicateLines({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("apple\nbanana\napple\norange\nbanana");
  const output = removeDuplicateLines(input);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Lines">
          <TextArea value={input} onChange={setInput} />
        </Panel>
        <Panel title="Unique lines" action={<CopyButton text={output} />}>
          <TextArea value={output} readOnly />
          <p className="mt-2 text-xs text-subtle">
            First occurrence is kept. Blank-line identity is based on trimmed text.
          </p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function TextReverser({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Rewrite this line");
  const [mode, setMode] = useState<"characters" | "words" | "lines">("characters");
  const output = reverseText(input, mode);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Original">
          <TextArea value={input} onChange={setInput} />
          <div className="mt-4">
            <SelectInput value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
              <option value="characters">Reverse characters</option>
              <option value="words">Reverse words</option>
              <option value="lines">Reverse lines</option>
            </SelectInput>
          </div>
        </Panel>
        <Panel title="Reversed" action={<CopyButton text={output} />}>
          <TextArea value={output} readOnly />
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ReadabilityChecker({ tool }: { tool: Tool }) {
  const [input, setInput] = useState(
    "Clear writing helps readers finish the page. Short sentences and familiar words usually raise readability scores.",
  );
  const stats = analyzeText(input);

  return (
    <ToolPageLayout
      tool={tool}
      extra={
        <section className="mt-4 rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-ink">How to read the score</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Flesch Reading Ease runs from 0 to 100. Higher is easier. The grade estimate is Flesch–Kincaid.
            These are guides, not a judgment of whether the writing is good.
          </p>
        </section>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your text">
          <TextArea value={input} onChange={setInput} />
        </Panel>
        <ResultCard title="Reading ease" value={formatNumber(stats.ease, 0)} subtitle={stats.easeLabel}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Grade level" value={formatNumber(Math.max(stats.grade, 0), 1)} />
            <Stat label="Avg words / sentence" value={formatNumber(stats.avgWordsPerSentence, 1)} />
            <Stat label="Words" value={String(stats.words)} />
            <Stat label="Sentences" value={String(stats.sentences)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
