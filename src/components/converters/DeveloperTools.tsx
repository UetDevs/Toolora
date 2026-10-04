"use client";

import { useMemo, useState } from "react";
import { Field, Panel, PrimaryButton, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { CodeBox, CopyButton } from "./shared";

function encodeUtf8Base64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeUtf8Base64(text: string) {
  const binary = atob(text.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const entityMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function encodeEntities(text: string) {
  return text.replace(/[&<>"']/g, (char) => entityMap[char] ?? char);
}

function decodeEntities(text: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

async function digest(algorithm: AlgorithmIdentifier, text: string) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function Base64Tool({ tool, lockedMode }: { tool: Tool; lockedMode?: "encode" | "decode" }) {
  const [input, setInput] = useState(lockedMode === "decode" ? "SGVsbG8gVG9vbG9yYQ==" : "Hello Toolora");
  const [mode, setMode] = useState(lockedMode ?? "encode");
  const result = useMemo(() => {
    try {
      return { value: mode === "encode" ? encodeUtf8Base64(input) : decodeUtf8Base64(input), error: "" };
    } catch {
      return { value: "", error: "Could not convert this value. Check the Base64 string." };
    }
  }, [input, mode]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          {lockedMode ? null : (
            <Field label="Mode">
              <SelectInput value={mode} onChange={(event) => setMode(event.target.value as "encode" | "decode")}>
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </SelectInput>
            </Field>
          )}
          <div className={lockedMode ? "" : "mt-4"}>
            <CodeBox value={input} onChange={setInput} />
          </div>
        </Panel>
        <Panel title="Result">
          <div className="mb-3 flex justify-end">
            <CopyButton text={result.value} />
          </div>
          {result.error ? <p className="mb-3 text-sm text-rose-600">{result.error}</p> : null}
          <p className="break-all font-mono text-sm text-ink">{result.value || "—"}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function UrlEncoder({ tool, lockedMode }: { tool: Tool; lockedMode?: "encode" | "decode" }) {
  const [input, setInput] = useState(
    lockedMode === "decode" ? "https%3A%2F%2Ftoolora.app%2Ftools%3Fq%3Dpdf%20to%20jpg" : "https://toolora.app/tools?q=pdf to jpg",
  );
  const [mode, setMode] = useState(lockedMode ?? "encode");
  let result = "";
  let error = "";
  try {
    result = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
  } catch {
    error = "Could not decode this URL string.";
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          {lockedMode ? null : (
            <Field label="Mode">
              <SelectInput value={mode} onChange={(event) => setMode(event.target.value as "encode" | "decode")}>
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </SelectInput>
            </Field>
          )}
          <div className={lockedMode ? "" : "mt-4"}>
            <CodeBox value={input} onChange={setInput} />
          </div>
        </Panel>
        <Panel title="Result">
          <div className="mb-3 flex justify-end">
            <CopyButton text={result} />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : <p className="break-all font-mono text-sm text-ink">{result}</p>}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function HtmlEntityEncoder({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('<p class="note">Hello & welcome to Toolora</p>');
  const [mode, setMode] = useState("encode");
  const result = mode === "encode" ? encodeEntities(input) : decodeEntities(input);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          <Field label="Mode">
            <SelectInput value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </SelectInput>
          </Field>
          <div className="mt-4">
            <CodeBox value={input} onChange={setInput} />
          </div>
        </Panel>
        <Panel title="Result">
          <div className="mb-3 flex justify-end">
            <CopyButton text={result} />
          </div>
          <p className="break-all font-mono text-sm text-ink">{result}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function UnixTimestamp({ tool }: { tool: Tool }) {
  const now = Math.floor(Date.now() / 1000);
  const [seconds, setSeconds] = useState(String(now));
  const [iso, setIso] = useState(new Date().toISOString().slice(0, 16));

  const fromUnix = (() => {
    const value = Number(seconds);
    if (!Number.isFinite(value)) return "Enter a valid timestamp.";
    const millis = Math.abs(value) < 1e12 ? value * 1000 : value;
    const date = new Date(millis);
    if (Number.isNaN(date.getTime())) return "Enter a valid timestamp.";
    return date.toISOString();
  })();

  const fromIso = (() => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Enter a valid date.";
    return String(Math.floor(date.getTime() / 1000));
  })();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Unix timestamp">
          <Field label="Seconds or milliseconds">
            <TextInput value={seconds} onChange={(event) => setSeconds(event.target.value)} />
          </Field>
          <p className="mt-4 text-sm text-muted">ISO date</p>
          <p className="mt-1 break-all font-mono text-sm text-ink">{fromUnix}</p>
          <PrimaryButton className="mt-4" onClick={() => setSeconds(String(Math.floor(Date.now() / 1000)))}>
            Use current time
          </PrimaryButton>
        </Panel>
        <Panel title="Date to timestamp">
          <Field label="Local date and time">
            <TextInput type="datetime-local" value={iso} onChange={(event) => setIso(event.target.value)} />
          </Field>
          <p className="mt-4 text-sm text-muted">Unix seconds</p>
          <p className="mt-1 font-mono text-sm text-ink">{fromIso}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function UuidGenerator({ tool }: { tool: Tool }) {
  const [count, setCount] = useState(5);
  const [values, setValues] = useState(() => Array.from({ length: 5 }, () => crypto.randomUUID()));

  function generate(nextCount = count) {
    setValues(Array.from({ length: Math.min(50, Math.max(1, nextCount)) }, () => crypto.randomUUID()));
  }

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="UUID v4">
        <Field label="How many">
          <TextInput
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </Field>
        <PrimaryButton className="mt-4" onClick={() => generate()}>
          Generate UUIDs
        </PrimaryButton>
        <div className="mt-4 flex justify-end">
          <CopyButton text={values.join("\n")} />
        </div>
        <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-4 font-mono text-sm">{values.join("\n")}</pre>
      </Panel>
    </ToolPageLayout>
  );
}

export function HashGenerator({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Hello Toolora");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          <Field label="Algorithm">
            <SelectInput value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </SelectInput>
          </Field>
          <div className="mt-4">
            <CodeBox value={input} onChange={setInput} />
          </div>
          <PrimaryButton
            className="mt-4"
            onClick={() => {
              void digest(algorithm, input)
                .then((value) => {
                  setOutput(value);
                  setError("");
                })
                .catch(() => {
                  setError("This browser could not generate that hash.");
                  setOutput("");
                });
            }}
          >
            Generate hash
          </PrimaryButton>
        </Panel>
        <Panel title="Hex digest">
          <div className="mb-3 flex justify-end">
            <CopyButton text={output} />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : <p className="break-all font-mono text-sm text-ink">{output || "Click Generate hash."}</p>}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}
