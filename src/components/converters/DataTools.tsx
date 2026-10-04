"use client";

import { useState } from "react";
import { Panel, PrimaryButton } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { formatXml, jsonToCsv, parseCsv, valueToYaml, xmlToJson, yamlToValue } from "@/lib/converters/data";
import { downloadText } from "@/lib/converters/files";
import type { Tool } from "@/lib/types";
import { CodeBox, CopyButton } from "./shared";

function DualConvert({
  tool,
  inputLabel,
  outputLabel,
  sample,
  actionLabel,
  convert,
  downloadName,
  downloadMime,
}: {
  tool: Tool;
  inputLabel: string;
  outputLabel: string;
  sample: string;
  actionLabel: string;
  convert: (input: string) => string;
  downloadName: string;
  downloadMime: string;
}) {
  const [input, setInput] = useState(sample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function run() {
    try {
      setOutput(convert(input));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not convert this input.");
      setOutput("");
    }
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={inputLabel}>
          <CodeBox value={input} onChange={setInput} />
          <PrimaryButton className="mt-4" onClick={run}>
            {actionLabel}
          </PrimaryButton>
        </Panel>
        <Panel title={outputLabel}>
          <div className="mb-3 flex justify-end gap-3">
            <CopyButton text={output} />
            <button
              type="button"
              disabled={!output}
              onClick={() => downloadText(output, downloadName, downloadMime)}
              className="text-sm font-semibold text-brand disabled:opacity-40"
            >
              Download
            </button>
          </div>
          {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
          <CodeBox value={output} readOnly placeholder="Result appears here." />
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JsonFormatter({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('{"hello":"toolora","ready":true,"tools":["json","csv","xml"]}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  function format(pretty: boolean) {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, pretty ? indent : 0));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="JSON input">
          <CodeBox value={input} onChange={setInput} />
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton className="w-auto px-5" onClick={() => format(true)}>
              Format
            </PrimaryButton>
            <button type="button" onClick={() => format(false)} className="h-12 rounded-lg border border-line px-5 text-sm font-semibold text-ink hover:bg-slate-50">
              Minify
            </button>
            <label className="flex items-center gap-2 text-sm text-muted">
              Indent
              <select value={indent} onChange={(event) => setIndent(Number(event.target.value))} className="h-10 rounded-lg border border-line px-2">
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
            </label>
          </div>
        </Panel>
        <Panel title="Formatted output">
          <div className="mb-3 flex justify-end">
            <CopyButton text={output} />
          </div>
          {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
          <CodeBox value={output} readOnly placeholder="Click Format to beautify your JSON." />
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JsonToCsv({ tool }: { tool: Tool }) {
  return (
    <DualConvert
      tool={tool}
      inputLabel="JSON array"
      outputLabel="CSV"
      sample={'[\n  {"name":"Aisha","score":92},\n  {"name":"Omar","score":88}\n]'}
      actionLabel="Convert to CSV"
      downloadName="data.csv"
      downloadMime="text/csv;charset=utf-8"
      convert={(input) => jsonToCsv(JSON.parse(input))}
    />
  );
}

export function CsvToJson({ tool }: { tool: Tool }) {
  return (
    <DualConvert
      tool={tool}
      inputLabel="CSV"
      outputLabel="JSON"
      sample={"name,score\nAisha,92\nOmar,88"}
      actionLabel="Convert to JSON"
      downloadName="data.json"
      downloadMime="application/json;charset=utf-8"
      convert={(input) => JSON.stringify(parseCsv(input), null, 2)}
    />
  );
}

export function XmlToJson({ tool }: { tool: Tool }) {
  return (
    <DualConvert
      tool={tool}
      inputLabel="XML"
      outputLabel="JSON"
      sample={"<students>\n  <student name=\"Aisha\" score=\"92\"/>\n  <student name=\"Omar\" score=\"88\"/>\n</students>"}
      actionLabel="Convert to JSON"
      downloadName="data.json"
      downloadMime="application/json;charset=utf-8"
      convert={(input) => JSON.stringify(xmlToJson(input), null, 2)}
    />
  );
}

export function XmlFormatter({ tool }: { tool: Tool }) {
  return (
    <DualConvert
      tool={tool}
      inputLabel="XML input"
      outputLabel="Formatted XML"
      sample={"<root><item id=\"1\"><name>Toolora</name></item></root>"}
      actionLabel="Format XML"
      downloadName="data.xml"
      downloadMime="application/xml;charset=utf-8"
      convert={formatXml}
    />
  );
}

export function YamlToJson({ tool }: { tool: Tool }) {
  return (
    <DualConvert
      tool={tool}
      inputLabel="YAML"
      outputLabel="JSON"
      sample={"site: Toolora\nready: true\ntools:\n  - json\n  - yaml"}
      actionLabel="Convert to JSON"
      downloadName="data.json"
      downloadMime="application/json;charset=utf-8"
      convert={(input) => JSON.stringify(yamlToValue(input) ?? null, null, 2)}
    />
  );
}

export function JsonToYaml({ tool }: { tool: Tool }) {
  return (
    <DualConvert
      tool={tool}
      inputLabel="JSON"
      outputLabel="YAML"
      sample={'{"site":"Toolora","ready":true,"tools":["json","yaml"]}'}
      actionLabel="Convert to YAML"
      downloadName="data.yaml"
      downloadMime="text/yaml;charset=utf-8"
      convert={(input) => valueToYaml(JSON.parse(input))}
    />
  );
}
