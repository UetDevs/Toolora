"use client";

import { useState } from "react";
import { Field, Panel, PrimaryButton, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CopyButton, FileDrop, FileMeta } from "@/components/converters/shared";
import { compressPdf, extractPdfText, mergePdfs, rotatePdf, splitPdf } from "@/lib/converters/pdf";
import { assertFileSize, downloadBytes, downloadText, stemName } from "@/lib/converters/files";
import type { Tool } from "@/lib/types";

const PRIVACY = "The file stays on this device. We do not get a copy.";

function useBusy() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, run };
}

export function MergePdf({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<File[]>([]);
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="PDF files">
        <FileDrop accept="application/pdf,.pdf" multiple hint="Two or more PDFs, each under 20 MB" onFiles={setFiles} />
        {files.length ? (
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        ) : null}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <PrimaryButton
          className="mt-4"
          disabled={files.length < 2 || busy}
          onClick={() =>
            void run(async () => {
              files.forEach((file) => assertFileSize(file));
              const bytes = await mergePdfs(files);
              downloadBytes(bytes, "merged.pdf", "application/pdf");
            })
          }
        >
          {busy ? "Merging…" : "Merge PDFs"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
      </Panel>
    </ToolPageLayout>
  );
}

export function SplitPdf({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState("1");
  const [end, setEnd] = useState("1");
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="Page range">
        <FileDrop accept="application/pdf,.pdf" hint="One PDF, up to 20 MB" onFiles={([next]) => setFile(next)} />
        <FileMeta file={file} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="From page"><TextInput value={start} inputMode="numeric" onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="To page"><TextInput value={end} inputMode="numeric" onChange={(e) => setEnd(e.target.value)} /></Field>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <PrimaryButton
          className="mt-4"
          disabled={!file || busy}
          onClick={() =>
            void run(async () => {
              if (!file) return;
              assertFileSize(file);
              const bytes = await splitPdf(file, Number(start) || 1, Number(end) || 1);
              downloadBytes(bytes, `${stemName(file.name)}-pages.pdf`, "application/pdf");
            })
          }
        >
          {busy ? "Splitting…" : "Download range"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
      </Panel>
    </ToolPageLayout>
  );
}

export function CompressPdf({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="PDF file">
        <FileDrop accept="application/pdf,.pdf" hint="One PDF, up to 20 MB. Photos compress more than text." onFiles={([next]) => setFile(next)} />
        <FileMeta file={file} />
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <PrimaryButton
          className="mt-4"
          disabled={!file || busy}
          onClick={() =>
            void run(async () => {
              if (!file) return;
              assertFileSize(file);
              const bytes = await compressPdf(file);
              downloadBytes(bytes, `${stemName(file.name)}-smaller.pdf`, "application/pdf");
            })
          }
        >
          {busy ? "Rebuilding pages…" : "Compress PDF"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY} Each page is redrawn as a JPEG. Links and selectable text are lost.</p>
      </Panel>
    </ToolPageLayout>
  );
}

export function RotatePdf({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [turn, setTurn] = useState<90 | 180 | 270>(90);
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="PDF file">
        <FileDrop accept="application/pdf,.pdf" hint="One PDF, up to 20 MB" onFiles={([next]) => setFile(next)} />
        <FileMeta file={file} />
        <div className="mt-4">
          <Field label="Turn">
            <SelectInput value={String(turn)} onChange={(e) => setTurn(Number(e.target.value) as 90 | 180 | 270)}>
              <option value="90">90°</option>
              <option value="180">180°</option>
              <option value="270">270°</option>
            </SelectInput>
          </Field>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <PrimaryButton
          className="mt-4"
          disabled={!file || busy}
          onClick={() =>
            void run(async () => {
              if (!file) return;
              assertFileSize(file);
              const bytes = await rotatePdf(file, turn);
              downloadBytes(bytes, `${stemName(file.name)}-rotated.pdf`, "application/pdf");
            })
          }
        >
          {busy ? "Rotating…" : "Rotate PDF"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
      </Panel>
    </ToolPageLayout>
  );
}

export function PdfToText({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="PDF file">
          <FileDrop accept="application/pdf,.pdf" hint="Text PDFs work. Scans without text will come back empty." onFiles={([next]) => { setFile(next); setText(""); }} />
          <FileMeta file={file} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton
            className="mt-4"
            disabled={!file || busy}
            onClick={() =>
              void run(async () => {
                if (!file) return;
                assertFileSize(file);
                const next = await extractPdfText(file);
                setText(next || "No selectable text in this file.");
              })
            }
          >
            {busy ? "Reading…" : "Extract text"}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Text" action={<CopyButton text={text} />}>
          <textarea readOnly value={text} className="min-h-64 w-full rounded-lg border border-line p-3 text-sm" />
          {text ? (
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-brand"
              onClick={() => downloadText(text, `${stemName(file?.name ?? "pdf")}.txt`)}
            >
              Download .txt
            </button>
          ) : null}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}
