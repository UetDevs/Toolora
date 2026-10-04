"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Field, Panel, PrimaryButton, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { downloadBlob, downloadCanvas, drawImage, loadImageFile, stemName, type LoadedImage } from "@/lib/image/canvas";
import { parseNumber } from "@/lib/utils";

const PRIVACY = "The photo stays on this device. We do not get a copy.";

function FilePicker({ accept = "image/*", onFile }: { accept?: string; onFile: (file: File) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-brand hover:bg-blue-50">
      <Upload className="h-6 w-6 text-brand" />
      <span className="mt-2 text-sm font-semibold text-ink">Choose an image</span>
      <input type="file" accept={accept} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); }} />
    </label>
  );
}

function Preview({ src }: { src: string | null }) {
  if (!src) return <p className="text-sm text-muted">Upload a photo to see the result.</p>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Preview" className="max-h-80 w-full rounded-xl object-contain" />
  );
}

function useLoaded() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [error, setError] = useState("");

  async function onFile(file: File) {
    try {
      if (loaded) URL.revokeObjectURL(loaded.url);
      setLoaded(await loadImageFile(file));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this file.");
    }
  }

  useEffect(() => () => { if (loaded) URL.revokeObjectURL(loaded.url); }, [loaded]);
  return { loaded, error, onFile };
}

export function HeicToJpg({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="HEIC photo">
          <FilePicker accept=".heic,.heif,image/heic,image/heif" onFile={(next) => { setFile(next); setPreview(null); setError(""); }} />
          {file ? <p className="mt-3 text-sm text-muted">{file.name}</p> : null}
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton
            className="mt-4"
            disabled={!file || busy}
            onClick={() => {
              void (async () => {
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  const heic2any = (await import("heic2any")).default;
                  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
                  const blob = Array.isArray(result) ? result[0] : result;
                  const url = URL.createObjectURL(blob);
                  setPreview(url);
                  downloadBlob(blob, `${stemName(file.name)}.jpg`);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "This browser could not decode the HEIC file.");
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            {busy ? "Converting…" : "Convert to JPG"}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="JPG"><Preview src={preview} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageWatermark({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoaded();
  const [text, setText] = useState("toolora.app");
  const [opacity, setOpacity] = useState("0.35");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Photo">
          <FilePicker onFile={(file) => { void onFile(file); }} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4 space-y-4">
            <Field label="Text"><TextInput value={text} onChange={(e) => setText(e.target.value)} /></Field>
            <Field label="Opacity"><TextInput value={opacity} onChange={(e) => setOpacity(e.target.value)} /></Field>
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height);
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.globalAlpha = Math.min(1, Math.max(0.05, parseNumber(opacity) ?? 0.35));
              ctx.fillStyle = "#ffffff";
              ctx.font = `${Math.round(loaded.image.width / 18)}px sans-serif`;
              ctx.fillText(text, 24, loaded.image.height - 32);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-mark.png`, "image/png");
            }}
          >
            Download watermarked PNG
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview"><Preview src={loaded?.url ?? null} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function PassportPhoto({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoaded();
  const [size, setSize] = useState("35x45");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Photo">
          <FilePicker onFile={(file) => { void onFile(file); }} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4">
            <Field label="Print size">
              <SelectInput value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="35x45">35 × 45 mm (many passports)</option>
                <option value="2x2">2 × 2 inch (US)</option>
              </SelectInput>
            </Field>
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const [wMm, hMm] = size === "2x2" ? [50.8, 50.8] : [35, 45];
              const width = Math.round((wMm / 25.4) * 300);
              const height = Math.round((hMm / 25.4) * 300);
              const src = loaded.image;
              const scale = Math.max(width / src.width, height / src.height);
              const sw = width / scale;
              const sh = height / scale;
              const sx = (src.width - sw) / 2;
              const sy = (src.height - sh) / 2;
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(src, sx, sy, sw, sh, 0, 0, width, height);
              void downloadCanvas(canvas, `passport-${size}.jpg`, "image/jpeg", 0.92);
            }}
          >
            Download print JPG
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY} Center-cropped at 300 DPI. Check your country’s photo rules.</p>
        </Panel>
        <Panel title="Preview"><Preview src={loaded?.url ?? null} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageGrayscale({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoaded();
  return (
    <FilterTool tool={tool} loaded={loaded} error={error} onFile={onFile} label="Download grayscale" filter="grayscale(1)" name="gray" />
  );
}

export function ImageBlur({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoaded();
  return (
    <FilterTool tool={tool} loaded={loaded} error={error} onFile={onFile} label="Download blurred" filter="blur(8px)" name="blur" />
  );
}

function FilterTool({
  tool,
  loaded,
  error,
  onFile,
  label,
  filter,
  name,
}: {
  tool: Tool;
  loaded: LoadedImage | null;
  error: string;
  onFile: (file: File) => Promise<void>;
  label: string;
  filter: string;
  name: string;
}) {
  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Photo">
          <FilePicker onFile={(file) => { void onFile(file); }} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height, (ctx) => {
                ctx.filter = filter;
              });
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-${name}.png`, "image/png");
            }}
          >
            {label}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview"><Preview src={loaded?.url ?? null} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageBorder({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoaded();
  const [width, setWidth] = useState("24");
  const [color, setColor] = useState("#ffffff");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Photo">
          <FilePicker onFile={(file) => { void onFile(file); }} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Border px"><TextInput value={width} onChange={(e) => setWidth(e.target.value)} /></Field>
            <Field label="Color"><TextInput type="color" value={color} onChange={(e) => setColor(e.target.value)} /></Field>
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const pad = Math.max(1, Math.round(parseNumber(width) ?? 24));
              const canvas = document.createElement("canvas");
              canvas.width = loaded.image.width + pad * 2;
              canvas.height = loaded.image.height + pad * 2;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(loaded.image, pad, pad);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-border.png`, "image/png");
            }}
          >
            Download with border
          </PrimaryButton>
        </Panel>
        <Panel title="Preview"><Preview src={loaded?.url ?? null} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function OgImageResizer({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoaded();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Image">
          <FilePicker onFile={(file) => { void onFile(file); }} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const canvas = document.createElement("canvas");
              canvas.width = 1200;
              canvas.height = 630;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.fillStyle = "#0f172a";
              ctx.fillRect(0, 0, 1200, 630);
              const scale = Math.max(1200 / loaded.image.width, 630 / loaded.image.height);
              const w = loaded.image.width * scale;
              const h = loaded.image.height * scale;
              ctx.drawImage(loaded.image, (1200 - w) / 2, (630 - h) / 2, w, h);
              void downloadCanvas(canvas, "og-1200x630.jpg", "image/jpeg", 0.9);
            }}
          >
            Download 1200×630
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview"><Preview src={loaded?.url ?? null} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

