"use client";

import { useState } from "react";
import { Field, Panel, PrimaryButton } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { downloadCanvasesAsZipFallback, extractDocxText, extractPdfText, imagesToPdf, renderPdfPages, textToPdfBytes, wordHtmlDocument } from "@/lib/converters/pdf";
import { assertFileSize, downloadBytes, downloadText, stemName } from "@/lib/converters/files";
import type { Tool } from "@/lib/types";
import { FileDrop, FileMeta } from "./shared";

const PRIVACY = "The file stays on this device. We do not get a copy.";

function useBusy() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not convert this file.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, note, setNote, setError, run };
}

export function PdfToJpg({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="PDF file">
          <FileDrop accept="application/pdf,.pdf" hint="One PDF, up to 20 MB" onFiles={([next]) => setFile(next)} />
          <FileMeta file={file} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton
            className="mt-4"
            disabled={!file || busy}
            onClick={() =>
              void run(async () => {
                if (!file) return;
                assertFileSize(file);
                const pages = await renderPdfPages(file);
                setPreviews(pages.map((page) => page.canvas.toDataURL("image/jpeg", 0.85)));
                downloadCanvasesAsZipFallback(pages);
              })
            }
          >
            {busy ? "Rendering pages…" : "Convert to JPG"}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY} Each page downloads as a separate JPG.</p>
        </Panel>
        <Panel title="Page preview">
          {previews.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {previews.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={`Page ${index + 1}`} className="rounded-lg border border-line" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Converted pages will appear here.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JpgToPdf({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<File[]>([]);
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="JPG images">
        <FileDrop
          accept="image/jpeg,.jpg,.jpeg,image/png,.png"
          multiple
          hint="JPG or PNG files become one PDF, one page each"
          onFiles={setFiles}
        />
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
          disabled={!files.length || busy}
          onClick={() =>
            void run(async () => {
              files.forEach(assertFileSize);
              const bytes = await imagesToPdf(files);
              downloadBytes(bytes, `${stemName(files[0].name)}.pdf`, "application/pdf");
            })
          }
        >
          {busy ? "Building PDF…" : "Convert to PDF"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
      </Panel>
    </ToolPageLayout>
  );
}

export function WordToPdf({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const { busy, error, note, setNote, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="Word document">
        <FileDrop accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hint="DOCX only — text is extracted, then wrapped into a PDF" onFiles={([next]) => setFile(next)} />
        <FileMeta file={file} />
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        {note ? <p className="mt-3 text-sm text-muted">{note}</p> : null}
        <PrimaryButton
          className="mt-4"
          disabled={!file || busy}
          onClick={() =>
            void run(async () => {
              if (!file) return;
              assertFileSize(file);
              const text = await extractDocxText(file);
              if (!text) throw new Error("No readable text was found in this document.");
              setNote(`${text.split(/\s+/).length} words extracted. Layout, images and fonts are not preserved.`);
              const bytes = await textToPdfBytes(text);
              downloadBytes(bytes, `${stemName(file.name)}.pdf`, "application/pdf");
            })
          }
        >
          {busy ? "Converting…" : "Convert to PDF"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY} This is a text-based conversion, not a pixel-perfect print.</p>
      </Panel>
    </ToolPageLayout>
  );
}

export function PdfToWord({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="PDF file">
          <FileDrop accept="application/pdf,.pdf" hint="Text-based PDFs work best" onFiles={([next]) => setFile(next)} />
          <FileMeta file={file} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton
            className="mt-4"
            disabled={!file || busy}
            onClick={() =>
              void run(async () => {
                if (!file) return;
                assertFileSize(file);
                const text = await extractPdfText(file);
                if (!text) throw new Error("No extractable text was found. Scanned PDFs need OCR, which this tool does not do.");
                setPreview(text);
                const html = wordHtmlDocument(text, stemName(file.name));
                downloadText(html, `${stemName(file.name)}.doc`, "application/msword");
              })
            }
          >
            {busy ? "Extracting text…" : "Convert to Word"}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY} Downloads a Word-compatible .doc with extracted text, not original layout.</p>
        </Panel>
        <Panel title="Extracted text">
          <pre className="min-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{preview || "Converted text will appear here."}</pre>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function TxtToPdf({ tool }: { tool: Tool }) {
  const [text, setText] = useState("Type or paste notes here. They will become a simple PDF.");
  const [file, setFile] = useState<File | null>(null);
  const { busy, error, run } = useBusy();

  return (
    <ToolPageLayout tool={tool}>
      <Panel title="Plain text">
        <FileDrop
          accept="text/plain,.txt"
          hint="Optional: load a .txt file"
          onFiles={([next]) => {
            setFile(next);
            void next.text().then(setText);
          }}
        />
        <FileMeta file={file} />
        <Field label="Text">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-1.5 min-h-56 w-full rounded-lg border border-line px-3.5 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </Field>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <PrimaryButton
          className="mt-4"
          disabled={!text.trim() || busy}
          onClick={() =>
            void run(async () => {
              const bytes = await textToPdfBytes(text);
              downloadBytes(bytes, `${file ? stemName(file.name) : "document"}.pdf`, "application/pdf");
            })
          }
        >
          {busy ? "Building PDF…" : "Convert to PDF"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
      </Panel>
    </ToolPageLayout>
  );
}
