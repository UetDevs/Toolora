"use client";

import { useMemo, useState } from "react";
import { Field, Panel, PrimaryButton, SelectInput, TextInput } from "@/components/calculators/fields";
import { CodeBox, CopyButton } from "@/components/converters/shared";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { decodeJwt, formatHtml, hslToRgb, minifyCss, parseHex, rgbToHex, rgbToHsl } from "@/lib/dev/format";
import type { Tool } from "@/lib/types";

function DualAction({
  tool,
  inputLabel,
  outputLabel,
  sample,
  action,
  convert,
}: {
  tool: Tool;
  inputLabel: string;
  outputLabel: string;
  sample: string;
  action: string;
  convert: (input: string) => Promise<string> | string;
}) {
  const [input, setInput] = useState(sample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={inputLabel}>
          <CodeBox value={input} onChange={setInput} />
          <PrimaryButton
            className="mt-4"
            onClick={() => {
              void Promise.resolve()
                .then(() => convert(input))
                .then((value) => {
                  setOutput(value);
                  setError("");
                })
                .catch((err) => {
                  setError(err instanceof Error ? err.message : "Could not process this input.");
                  setOutput("");
                });
            }}
          >
            {action}
          </PrimaryButton>
        </Panel>
        <Panel title={outputLabel}>
          <div className="mb-3 flex justify-end">
            <CopyButton text={output} />
          </div>
          {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
          <CodeBox value={output} readOnly placeholder="Result appears here." />
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JsonValidator({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('{"ok":true,"tools":["json"]}');
  const [message, setMessage] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="JSON">
          <CodeBox value={input} onChange={setInput} />
          <PrimaryButton
            className="mt-4"
            onClick={() => {
              try {
                JSON.parse(input);
                setValid(true);
                setMessage("This JSON is valid.");
              } catch (err) {
                setValid(false);
                setMessage(err instanceof Error ? err.message : "Invalid JSON");
              }
            }}
          >
            Validate JSON
          </PrimaryButton>
        </Panel>
        <Panel title="Result">
          {valid == null ? (
            <p className="text-sm text-muted">Paste JSON. You will see valid or the first error.</p>
          ) : (
            <p className={valid ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-rose-600"}>{message}</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JsonMinifier({ tool }: { tool: Tool }) {
  return (
    <DualAction
      tool={tool}
      inputLabel="JSON"
      outputLabel="Minified JSON"
      sample={'{\n  "hello": "toolora",\n  "ready": true\n}'}
      action="Minify JSON"
      convert={(input) => JSON.stringify(JSON.parse(input))}
    />
  );
}

export function RegexTester({ tool }: { tool: Tool }) {
  const [pattern, setPattern] = useState("tool[a-z]+");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = regex.global
        ? [...text.matchAll(regex)].map((match) => ({
            value: match[0],
            index: match.index ?? 0,
            groups: match.slice(1),
          }))
        : (() => {
            const match = regex.exec(text);
            return match
              ? [{ value: match[0], index: match.index ?? 0, groups: match.slice(1) }]
              : [];
          })();
      return { error: "", matches };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Invalid regular expression.", matches: [] };
    }
  }, [pattern, flags, text]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Expression">
          <Field label="Pattern">
            <TextInput value={pattern} onChange={(event) => setPattern(event.target.value)} />
          </Field>
          <div className="mt-4">
            <Field label="Flags">
              <TextInput value={flags} onChange={(event) => setFlags(event.target.value)} placeholder="g, i, m, s, u, y" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Test string">
              <CodeBox value={text} onChange={setText} />
            </Field>
          </div>
        </Panel>
        <Panel title="Matches">
          {result.error ? <p className="text-sm text-rose-600">{result.error}</p> : null}
          {!result.error && !result.matches.length ? <p className="text-sm text-muted">No matches.</p> : null}
          <ul className="space-y-2">
            {result.matches.map((match, index) => (
              <li key={`${match.index}-${index}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="font-mono font-semibold text-ink">{match.value}</span>
                <span className="ml-2 text-subtle">at {match.index}</span>
                {match.groups.length ? <p className="mt-1 text-xs text-muted">Groups: {match.groups.join(", ")}</p> : null}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JwtDecoder({ tool }: { tool: Tool }) {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0b29sb3JhIiwibmFtZSI6IlRvb2xvcmEiLCJpYXQiOjE3MDk1MDAwMDB9.signature",
  );
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="JWT">
          <CodeBox value={token} onChange={setToken} />
          <PrimaryButton
            className="mt-4"
            onClick={() => {
              try {
                const decoded = decodeJwt(token);
                setHeader(JSON.stringify(decoded.header, null, 2));
                setPayload(JSON.stringify(decoded.payload, null, 2));
                setError("");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not decode this token.");
                setHeader("");
                setPayload("");
              }
            }}
          >
            Decode JWT
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">This reads the header and payload only. The signature is not verified.</p>
        </Panel>
        <Panel title="Decoded">
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <p className="mb-2 text-sm font-semibold text-ink">Header</p>
          <CodeBox value={header} readOnly />
          <p className="mb-2 mt-4 text-sm font-semibold text-ink">Payload</p>
          <div className="mb-2 flex justify-end">
            <CopyButton text={payload} />
          </div>
          <CodeBox value={payload} readOnly />
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function HtmlFormatter({ tool }: { tool: Tool }) {
  return (
    <DualAction
      tool={tool}
      inputLabel="HTML"
      outputLabel="Formatted HTML"
      sample={"<section><h1>Toolora</h1><p>Free browser tools.</p></section>"}
      action="Format HTML"
      convert={formatHtml}
    />
  );
}

export function CssMinifier({ tool }: { tool: Tool }) {
  return (
    <DualAction
      tool={tool}
      inputLabel="CSS"
      outputLabel="Minified CSS"
      sample={"body {\n  color: #0f172a;\n  background: #fff;\n}"}
      action="Minify CSS"
      convert={minifyCss}
    />
  );
}

export function JsMinifier({ tool }: { tool: Tool }) {
  return (
    <DualAction
      tool={tool}
      inputLabel="JavaScript"
      outputLabel="Minified JavaScript"
      sample={"function greet(name) {\n  return `Hello ${name}`;\n}\n"}
      action="Minify JavaScript"
      convert={async (input) => {
        const { minify } = await import("terser");
        const result = await minify(input, { module: true });
        if (!result.code) throw new Error("Could not minify this JavaScript.");
        return result.code;
      }}
    />
  );
}

export function SqlFormatter({ tool }: { tool: Tool }) {
  return (
    <DualAction
      tool={tool}
      inputLabel="SQL"
      outputLabel="Formatted SQL"
      sample={"select name, score from students where score > 80 order by score desc;"}
      action="Format SQL"
      convert={async (input) => {
        const { format } = await import("sql-formatter");
        return format(input, { language: "sql" });
      }}
    />
  );
}

export function MarkdownToHtml({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("# Notes\n\nWrite **bold** text or a [link](https://example.com).");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Markdown">
          <CodeBox value={input} onChange={setInput} />
          <PrimaryButton
            className="mt-4"
            onClick={() => {
              void import("marked")
                .then(({ marked }) => marked.parse(input, { async: false }))
                .then((html) => {
                  setOutput(String(html));
                  setError("");
                })
                .catch((err) => {
                  setError(err instanceof Error ? err.message : "Could not convert this Markdown.");
                  setOutput("");
                });
            }}
          >
            Convert to HTML
          </PrimaryButton>
        </Panel>
        <Panel title="HTML">
          <div className="mb-3 flex justify-end">
            <CopyButton text={output} />
          </div>
          {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
          <CodeBox value={output} readOnly />
          {output ? (
            <div className="prose mt-4 max-w-none rounded-xl border border-line p-4 text-sm" dangerouslySetInnerHTML={{ __html: output }} />
          ) : null}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ColorConverter({ tool }: { tool: Tool }) {
  const [hex, setHex] = useState("#2563EB");
  const [rgb, setRgb] = useState({ r: 37, g: 99, b: 235 });
  const [hsl, setHsl] = useState({ h: 221, s: 83, l: 53 });
  const [error, setError] = useState("");

  function applyRgb(next: { r: number; g: number; b: number }) {
    setRgb(next);
    setHex(rgbToHex(next.r, next.g, next.b));
    const converted = rgbToHsl(next.r, next.g, next.b);
    setHsl({ h: Math.round(converted.h), s: Math.round(converted.s), l: Math.round(converted.l) });
    setError("");
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Color values">
          <Field label="Hex">
            <TextInput
              value={hex}
              onChange={(event) => {
                setHex(event.target.value);
                try {
                  applyRgb(parseHex(event.target.value));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Invalid hex color.");
                }
              }}
            />
          </Field>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(["r", "g", "b"] as const).map((channel) => (
              <Field key={channel} label={channel.toUpperCase()}>
                <TextInput
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[channel]}
                  onChange={(event) => applyRgb({ ...rgb, [channel]: Number(event.target.value) })}
                />
              </Field>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Field label="H">
              <TextInput
                type="number"
                value={hsl.h}
                onChange={(event) => {
                  const next = { ...hsl, h: Number(event.target.value) };
                  setHsl(next);
                  applyRgb(hslToRgb(next.h, next.s, next.l));
                }}
              />
            </Field>
            <Field label="S">
              <TextInput
                type="number"
                value={hsl.s}
                onChange={(event) => {
                  const next = { ...hsl, s: Number(event.target.value) };
                  setHsl(next);
                  applyRgb(hslToRgb(next.h, next.s, next.l));
                }}
              />
            </Field>
            <Field label="L">
              <TextInput
                type="number"
                value={hsl.l}
                onChange={(event) => {
                  const next = { ...hsl, l: Number(event.target.value) };
                  setHsl(next);
                  applyRgb(hslToRgb(next.h, next.s, next.l));
                }}
              />
            </Field>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </Panel>
        <Panel title="Preview">
          <div className="h-32 rounded-2xl border border-line" style={{ backgroundColor: rgbToHex(rgb.r, rgb.g, rgb.b) }} />
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">HEX</dt><dd className="font-mono">{rgbToHex(rgb.r, rgb.g, rgb.b)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">RGB</dt><dd className="font-mono">{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">HSL</dt><dd className="font-mono">{`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}</dd></div>
          </dl>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}
