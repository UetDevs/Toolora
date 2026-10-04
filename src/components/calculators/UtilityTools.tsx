"use client";

import { useMemo, useState } from "react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { formatNumber, parseNumber } from "@/lib/utils";
import { Field, Panel, PrimaryButton, ResultCard, SelectInput, TextInput } from "./fields";

export function JsonFormatter({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('{"hello":"toolora","ready":true}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function format() {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="JSON Input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-64 w-full rounded-lg border border-line px-3.5 py-3 font-mono text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <PrimaryButton className="mt-4" onClick={format}>Format JSON</PrimaryButton>
        </Panel>
        <Panel title="Formatted Output">
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <pre className="min-h-64 overflow-auto rounded-lg bg-slate-50 p-4 text-sm">{output || "Click Format JSON to beautify your data."}</pre>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function Base64Tool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("Hello Toolora");
  const [mode, setMode] = useState("encode");
  const result = useMemo(() => {
    try {
      return mode === "encode" ? btoa(input) : atob(input);
    } catch {
      return "Could not convert this value.";
    }
  }, [input, mode]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          <Field label="Mode">
            <SelectInput value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </SelectInput>
          </Field>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-4 min-h-40 w-full rounded-lg border border-line px-3.5 py-3 text-sm outline-none focus:border-brand"
          />
        </Panel>
        <Panel title="Result">
          <p className="break-all font-mono text-sm text-ink">{result}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function WordCounter({ tool }: { tool: Tool }) {
  const [text, setText] = useState("Paste a paragraph here to count the words.");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your Text">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-52 w-full rounded-lg border border-line px-3.5 py-3 text-sm outline-none focus:border-brand"
          />
        </Panel>
        <ResultCard title="Words" value={String(words)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-subtle">Characters</p>
              <p className="font-semibold">{chars}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-subtle">Sentences</p>
              <p className="font-semibold">{sentences}</p>
            </div>
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

const lengthToMeter: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  ft: 0.3048,
  in: 0.0254,
  mi: 1609.344,
  yd: 0.9144,
};

const weightToKg: Record<string, number> = {
  kg: 1,
  g: 0.001,
  lb: 0.453592,
  oz: 0.0283495,
  t: 1000,
};

export function LengthConverter({ tool }: { tool: Tool }) {
  return <UnitTool tool={tool} units={lengthToMeter} defaultFrom="m" defaultTo="ft" />;
}

export function WeightConverter({ tool }: { tool: Tool }) {
  return <UnitTool tool={tool} units={weightToKg} defaultFrom="kg" defaultTo="lb" />;
}

export function TemperatureConverter({ tool }: { tool: Tool }) {
  const [value, setValue] = useState("32");
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");
  const n = parseNumber(value);
  const celsius = n == null ? null : from === "C" ? n : from === "F" ? ((n - 32) * 5) / 9 : n - 273.15;
  const converted =
    celsius == null ? null : to === "C" ? celsius : to === "F" ? (celsius * 9) / 5 + 32 : celsius + 273.15;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Convert Temperature">
          <div className="space-y-4">
            <Field label="Value"><TextInput value={value} onChange={(e) => setValue(e.target.value)} /></Field>
            <Field label="From">
              <SelectInput value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
                <option value="K">Kelvin</option>
              </SelectInput>
            </Field>
            <Field label="To">
              <SelectInput value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
                <option value="K">Kelvin</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Converted" value={converted == null ? "—" : formatNumber(converted)} />
      </div>
    </ToolPageLayout>
  );
}

function UnitTool({
  tool,
  units,
  defaultFrom,
  defaultTo,
}: {
  tool: Tool;
  units: Record<string, number>;
  defaultFrom: string;
  defaultTo: string;
}) {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const n = parseNumber(value);
  const converted = n == null ? null : (n * units[from]) / units[to];

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Convert">
          <div className="space-y-4">
            <Field label="Value"><TextInput value={value} onChange={(e) => setValue(e.target.value)} /></Field>
            <Field label="From">
              <SelectInput value={from} onChange={(e) => setFrom(e.target.value)}>
                {Object.keys(units).map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="To">
              <SelectInput value={to} onChange={(e) => setTo(e.target.value)}>
                {Object.keys(units).map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Converted" value={converted == null ? "—" : formatNumber(converted)} />
      </div>
    </ToolPageLayout>
  );
}
