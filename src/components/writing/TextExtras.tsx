"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Field, Panel, ResultCard, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";

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

function Box({ value, onChange, readOnly }: { value: string; onChange?: (value: string) => void; readOnly?: boolean }) {
  return (
    <textarea
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange?.(event.target.value)}
      className="min-h-48 w-full rounded-lg border border-line p-3 text-sm outline-none focus:border-brand"
    />
  );
}

export function RemoveExtraSpaces({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Too   many    spaces.\n\n\nAnd blank lines.");
  const output = input.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Draft"><Box value={input} onChange={setInput} /></Panel>
        <Panel title="Tidied" action={<CopyButton text={output} />}><Box value={output} readOnly /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function FindAndReplace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("The cat sat on the mat.");
  const [find, setFind] = useState("cat");
  const [replace, setReplace] = useState("dog");
  const [sensitive, setSensitive] = useState(false);
  const output = useMemo(() => {
    if (!find) return input;
    const flags = sensitive ? "g" : "gi";
    try {
      return input.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags), replace);
    } catch {
      return input;
    }
  }, [input, find, replace, sensitive]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Draft">
          <Box value={input} onChange={setInput} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Find"><TextInput value={find} onChange={(e) => setFind(e.target.value)} /></Field>
            <Field label="Replace with"><TextInput value={replace} onChange={(e) => setReplace(e.target.value)} /></Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} />
            Match case
          </label>
        </Panel>
        <Panel title="Result" action={<CopyButton text={output} />}><Box value={output} readOnly /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function SortLines({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("mango\napple\nbanana\napple");
  const [dir, setDir] = useState("az");
  const [unique, setUnique] = useState(false);
  const output = useMemo(() => {
    let lines = input.split(/\r?\n/);
    if (unique) lines = [...new Set(lines)];
    lines.sort((a, b) => a.localeCompare(b));
    if (dir === "za") lines.reverse();
    return lines.join("\n");
  }, [input, dir, unique]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Lines">
          <Box value={input} onChange={setInput} />
          <div className="mt-4">
            <SelectInput value={dir} onChange={(e) => setDir(e.target.value)}>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
            </SelectInput>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
            Drop duplicate lines
          </label>
        </Panel>
        <Panel title="Sorted" action={<CopyButton text={output} />}><Box value={output} readOnly /></Panel>
      </div>
    </ToolPageLayout>
  );
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.";

export function LoremIpsum({ tool }: { tool: Tool }) {
  const [count, setCount] = useState("3");
  const n = Math.min(20, Math.max(1, Number(count) || 1));
  const output = Array.from({ length: n }, () => LOREM).join("\n\n");

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="Dummy text" action={<CopyButton text={output} />}>
        <Field label="Paragraphs"><TextInput value={count} onChange={(e) => setCount(e.target.value)} /></Field>
        <div className="mt-4"><Box value={output} readOnly /></div>
      </Panel>
    </ToolPageLayout>
  );
}

export function TextCompare({ tool }: { tool: Tool }) {
  const [left, setLeft] = useState("First draft.\nKeep this line.");
  const [right, setRight] = useState("Second draft.\nKeep this line.");
  const rows = useMemo(() => {
    const a = left.split(/\r?\n/);
    const b = right.split(/\r?\n/);
    const max = Math.max(a.length, b.length);
    return Array.from({ length: max }, (_, index) => ({
      left: a[index] ?? "",
      right: b[index] ?? "",
      same: (a[index] ?? "") === (b[index] ?? ""),
    }));
  }, [left, right]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Version A"><Box value={left} onChange={setLeft} /></Panel>
        <Panel title="Version B"><Box value={right} onChange={setRight} /></Panel>
      </div>
      <Panel title="Line by line">
        <div className="space-y-2 text-sm">
          {rows.map((row, index) => (
            <div key={`${index}-${row.left}`} className={`rounded-lg px-3 py-2 ${row.same ? "bg-slate-50" : "bg-amber-50"}`}>
              <p className="text-xs text-subtle">Line {index + 1}{row.same ? "" : " — differs"}</p>
              <p className="font-medium text-ink">{row.left || "—"}</p>
              {row.same ? null : <p className="text-muted">{row.right || "—"}</p>}
            </div>
          ))}
        </div>
      </Panel>
    </ToolPageLayout>
  );
}

export function MetaDescriptionCounter({ tool }: { tool: Tool }) {
  const [title, setTitle] = useState("BMI calculator");
  const [desc, setDesc] = useState("Height and weight in. BMI and a range out.");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Snippet">
          <div className="space-y-4">
            <Field label="Title">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Meta description">
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-28 w-full rounded-lg border border-line p-3 text-sm" />
            </Field>
          </div>
        </Panel>
        <ResultCard title="Description" value={`${desc.length}`} subtitle={desc.length <= 160 ? "within 160" : "over 160"}>
          <p className="mt-4 text-sm text-muted">Title: {title.length} characters (aim under 60).</p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

