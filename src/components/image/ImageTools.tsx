"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Upload } from "lucide-react";
import { Field, Panel, PrimaryButton, ResultCard, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { formatNumber, parseNumber } from "@/lib/utils";
import {
  canvasToBlob,
  downloadBlob,
  downloadCanvas,
  drawImage,
  extensionFor,
  formatBytes,
  loadImageFile,
  loadImageSrc,
  pngToIco,
  readJpegExif,
  stemName,
  type ImageFormat,
  type LoadedImage,
} from "@/lib/image/canvas";

const PRIVACY = "The photo stays on this device. We do not get a copy.";

function FilePicker({
  accept = "image/*",
  onFile,
}: {
  accept?: string;
  onFile: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-brand hover:bg-blue-50">
      <Upload className="h-6 w-6 text-brand" />
      <span className="mt-2 text-sm font-semibold text-ink">Choose an image</span>
      <span className="mt-1 text-xs text-subtle">JPG, PNG, WebP and other browser-supported formats</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function Preview({ src, alt = "Preview" }: { src: string | null; alt?: string }) {
  if (!src) return <p className="text-sm text-muted">Upload an image to see the preview.</p>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="max-h-80 w-full rounded-xl object-contain" />
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

function useLoadedImage() {
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

  useEffect(() => () => {
    if (loaded) URL.revokeObjectURL(loaded.url);
  }, [loaded]);

  return { loaded, error, onFile };
}

export function ImageResizer({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const ratio = loaded ? loaded.image.width / loaded.image.height : 1;

  useEffect(() => {
    if (!loaded) return;
    setWidth(String(loaded.image.width));
    setHeight(String(loaded.image.height));
  }, [loaded]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Resize">
          <FilePicker onFile={(file) => { void onFile(file); }} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Width">
              <TextInput
                value={width}
                onChange={(event) => {
                  setWidth(event.target.value);
                  const next = parseNumber(event.target.value);
                  if (lock && next) setHeight(String(Math.round(next / ratio)));
                }}
              />
            </Field>
            <Field label="Height">
              <TextInput
                value={height}
                onChange={(event) => {
                  setHeight(event.target.value);
                  const next = parseNumber(event.target.value);
                  if (lock && next) setWidth(String(Math.round(next * ratio)));
                }}
              />
            </Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={lock} onChange={(event) => setLock(event.target.checked)} />
            Keep aspect ratio
          </label>
          <div className="mt-3">
            <Field label="Download format">
              <SelectInput value={format} onChange={(event) => setFormat(event.target.value as ImageFormat)}>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </SelectInput>
            </Field>
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const w = parseNumber(width);
              const h = parseNumber(height);
              if (!w || !h) return;
              const canvas = drawImage(loaded.image, w, h);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-${w}x${h}.${extensionFor(format)}`, format);
            }}
          >
            Download resized image
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview">
          <Preview src={loaded?.url ?? null} />
          {loaded ? (
            <p className="mt-3 text-sm text-muted">
              Original {loaded.image.width} × {loaded.image.height} · {formatBytes(loaded.file.size)}
            </p>
          ) : null}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageCompressor({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<ImageFormat>("image/jpeg");
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  useEffect(() => {
    if (!loaded) return;
    let active = true;
    const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height);
    void canvasToBlob(canvas, format, quality).then((blob) => {
      if (!active) return;
      setResult({ url: URL.createObjectURL(blob), size: blob.size });
    });
    return () => {
      active = false;
    };
  }, [loaded, quality, format]);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Compress">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <Field label={`Quality ${Math.round(quality * 100)}%`}>
            <input
              type="range"
              min={0.3}
              max={0.95}
              step={0.05}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="mt-2 w-full accent-brand"
            />
          </Field>
          <div className="mt-3">
            <Field label="Output">
              <SelectInput value={format} onChange={(event) => setFormat(event.target.value as ImageFormat)}>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </SelectInput>
            </Field>
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded || !result}
            onClick={async () => {
              if (!loaded) return;
              const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height);
              await downloadCanvas(canvas, `${stemName(loaded.file.name)}-compressed.${extensionFor(format)}`, format, quality);
            }}
          >
            Download compressed image
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Comparison">
          <Preview src={result?.url ?? loaded?.url ?? null} />
          {loaded && result ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Original" value={formatBytes(loaded.file.size)} />
              <Stat label="Compressed" value={formatBytes(result.size)} />
            </div>
          ) : null}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageCropper({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const frame = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const drag = useRef<{ startX: number; startY: number; mode: "new" | "move"; ox: number; oy: number } | null>(null);

  function imageBox() {
    if (!loaded) return { x: 0, y: 0, w: 0, h: 0 };
    return {
      x: Math.round((crop.x / 100) * loaded.image.width),
      y: Math.round((crop.y / 100) * loaded.image.height),
      w: Math.round((crop.w / 100) * loaded.image.width),
      h: Math.round((crop.h / 100) * loaded.image.height),
    };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    drag.current = { startX: x, startY: y, mode: "new", ox: crop.x, oy: crop.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const left = Math.max(0, Math.min(drag.current.startX, x));
    const top = Math.max(0, Math.min(drag.current.startY, y));
    const right = Math.min(100, Math.max(drag.current.startX, x));
    const bottom = Math.min(100, Math.max(drag.current.startY, y));
    setCrop({ x: left, y: top, w: Math.max(4, right - left), h: Math.max(4, bottom - top) });
  }

  const box = imageBox();

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Crop">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="X"><TextInput value={String(box.x)} readOnly /></Field>
            <Field label="Y"><TextInput value={String(box.y)} readOnly /></Field>
            <Field label="Width"><TextInput value={String(box.w)} readOnly /></Field>
            <Field label="Height"><TextInput value={String(box.h)} readOnly /></Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "1:1", w: 50, h: 50 },
              { label: "4:3", w: 64, h: 48 },
              { label: "16:9", w: 80, h: 45 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-muted hover:bg-slate-200"
                onClick={() => setCrop({ x: (100 - preset.w) / 2, y: (100 - preset.h) / 2, w: preset.w, h: preset.h })}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded || box.w < 2 || box.h < 2) return;
              const canvas = document.createElement("canvas");
              canvas.width = box.w;
              canvas.height = box.h;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.drawImage(loaded.image, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-crop.png`, "image/png");
            }}
          >
            Download crop
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">Drag on the preview to choose the crop area. {PRIVACY}</p>
        </Panel>
        <Panel title="Preview">
          {loaded ? (
            <div
              ref={frame}
              className="relative cursor-crosshair overflow-hidden rounded-xl bg-slate-100"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => {
                drag.current = null;
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={loaded.url} alt="Crop source" className="block max-h-80 w-full object-contain" />
              <span
                className="pointer-events-none absolute border-2 border-brand bg-brand/10"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.w}%`,
                  height: `${crop.h}%`,
                }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">Upload an image, then drag to crop.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

function FormatConverter({
  tool,
  from,
  to,
  accept,
}: {
  tool: Tool;
  from?: string;
  to: ImageFormat;
  accept?: string;
}) {
  const { loaded, error, onFile } = useLoadedImage();
  const [quality, setQuality] = useState(0.9);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Convert">
          <FilePicker accept={accept ?? "image/*"} onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          {to !== "image/png" ? (
            <Field label={`Quality ${Math.round(quality * 100)}%`}>
              <input type="range" min={0.4} max={1} step={0.05} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-2 w-full accent-brand" />
            </Field>
          ) : null}
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height);
              if (to === "image/jpeg") {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.globalCompositeOperation = "destination-over";
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
              }
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}.${extensionFor(to)}`, to, quality);
            }}
          >
            Download {extensionFor(to).toUpperCase()}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">
            {from ? `Best with ${from} files. ` : null}
            {PRIVACY}
          </p>
        </Panel>
        <Panel title="Preview">
          <Preview src={loaded?.url ?? null} />
          {loaded ? <p className="mt-3 text-sm text-muted">{loaded.image.width} × {loaded.image.height}</p> : null}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageConverter({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(0.9);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Convert format">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4">
            <Field label="Convert to">
              <SelectInput value={format} onChange={(event) => setFormat(event.target.value as ImageFormat)}>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </SelectInput>
            </Field>
          </div>
          {format !== "image/png" ? (
            <Field label={`Quality ${Math.round(quality * 100)}%`}>
              <input type="range" min={0.4} max={1} step={0.05} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-2 w-full accent-brand" />
            </Field>
          ) : null}
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}.${extensionFor(format)}`, format, quality);
            }}
          >
            Download converted image
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview"><Preview src={loaded?.url ?? null} /></Panel>
      </div>
    </ToolPageLayout>
  );
}

export function JpgToPng({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="JPG" to="image/png" accept="image/jpeg,.jpg,.jpeg" />;
}
export function PngToJpg({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="PNG" to="image/jpeg" accept="image/png,.png" />;
}
export function WebpToJpg({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="WebP" to="image/jpeg" accept="image/webp,.webp" />;
}
export function JpgToWebp({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="JPG" to="image/webp" accept="image/jpeg,.jpg,.jpeg" />;
}
export function PngToWebp({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="PNG" to="image/webp" accept="image/png,.png" />;
}
export function WebpToPng({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="WebP" to="image/png" accept="image/webp,.webp" />;
}

export function SvgToPng({ tool }: { tool: Tool }) {
  return <FormatConverter tool={tool} from="SVG" to="image/png" accept="image/svg+xml,.svg" />;
}

export function ImageToBase64({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [data, setData] = useState("");

  useEffect(() => {
    if (!loaded) return;
    const canvas = drawImage(loaded.image, loaded.image.width, loaded.image.height);
    setData(canvas.toDataURL(loaded.file.type || "image/png"));
  }, [loaded]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Image">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4"><Preview src={loaded?.url ?? null} /></div>
        </Panel>
        <Panel title="Base64 data URL" action={<CopyButton text={data} />}>
          <textarea
            readOnly
            value={data}
            className="min-h-56 w-full rounded-lg border border-line p-3 font-mono text-xs"
            placeholder="Upload an image to encode it."
          />
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function Base64ToImage({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function previewSource() {
    try {
      const src = input.trim().startsWith("data:") ? input.trim() : `data:image/png;base64,${input.trim()}`;
      await loadImageSrc(src);
      setPreview(src);
      setError("");
    } catch {
      setPreview(null);
      setError("This does not look like a valid image data URL or Base64 string.");
    }
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Base64">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-56 w-full rounded-lg border border-line p-3 font-mono text-xs outline-none focus:border-brand"
            placeholder="Paste a data:image/...;base64, string or raw Base64."
          />
          <PrimaryButton className="mt-4" onClick={() => void previewSource()} disabled={!input.trim()}>
            Preview image
          </PrimaryButton>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </Panel>
        <Panel title="Image">
          <Preview src={preview} />
          <PrimaryButton
            className="mt-4"
            disabled={!preview}
            onClick={async () => {
              if (!preview) return;
              const image = await loadImageSrc(preview);
              const canvas = drawImage(image, image.width, image.height);
              await downloadCanvas(canvas, "from-base64.png", "image/png");
            }}
          >
            Download PNG
          </PrimaryButton>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageRotator({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [angle, setAngle] = useState(90);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Rotate">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {[90, 180, 270].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAngle(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${angle === value ? "bg-brand text-white" : "bg-slate-100 text-muted"}`}
              >
                {value}°
              </button>
            ))}
          </div>
          <Field label="Custom angle">
            <input type="range" min={-180} max={180} value={angle} onChange={(event) => setAngle(Number(event.target.value))} className="mt-2 w-full accent-brand" />
          </Field>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const radians = (angle * Math.PI) / 180;
              const sin = Math.abs(Math.sin(radians));
              const cos = Math.abs(Math.cos(radians));
              const width = loaded.image.width * cos + loaded.image.height * sin;
              const height = loaded.image.width * sin + loaded.image.height * cos;
              const canvas = document.createElement("canvas");
              canvas.width = Math.round(width);
              canvas.height = Math.round(height);
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate(radians);
              ctx.drawImage(loaded.image, -loaded.image.width / 2, -loaded.image.height / 2);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-rotated.png`, "image/png");
            }}
          >
            Download rotated image
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview">
          {loaded ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loaded.url} alt="Rotate source" className="mx-auto max-h-80 rounded-xl object-contain" style={{ transform: `rotate(${angle}deg)` }} />
          ) : (
            <p className="text-sm text-muted">Upload an image to rotate it.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageFlipper({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [mode, setMode] = useState<"horizontal" | "vertical">("horizontal");

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Flip">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setMode("horizontal")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${mode === "horizontal" ? "bg-brand text-white" : "bg-slate-100 text-muted"}`}>Horizontal</button>
            <button type="button" onClick={() => setMode("vertical")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${mode === "vertical" ? "bg-brand text-white" : "bg-slate-100 text-muted"}`}>Vertical</button>
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={() => {
              if (!loaded) return;
              const canvas = document.createElement("canvas");
              canvas.width = loaded.image.width;
              canvas.height = loaded.image.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.translate(mode === "horizontal" ? canvas.width : 0, mode === "vertical" ? canvas.height : 0);
              ctx.scale(mode === "horizontal" ? -1 : 1, mode === "vertical" ? -1 : 1);
              ctx.drawImage(loaded.image, 0, 0);
              void downloadCanvas(canvas, `${stemName(loaded.file.name)}-flip.png`, "image/png");
            }}
          >
            Download flipped image
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY}</p>
        </Panel>
        <Panel title="Preview">
          {loaded ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loaded.url}
              alt="Flip source"
              className="max-h-80 w-full rounded-xl object-contain"
              style={{ transform: mode === "horizontal" ? "scaleX(-1)" : "scaleY(-1)" }}
            />
          ) : (
            <p className="text-sm text-muted">Upload an image to flip it.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageMetadataViewer({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const [exif, setExif] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (!loaded) return;
    void readJpegExif(loaded.file).then(setExif);
  }, [loaded]);

  const rows = loaded
    ? [
        ["File name", loaded.file.name],
        ["Type", loaded.file.type || "Unknown"],
        ["Size", formatBytes(loaded.file.size)],
        ["Width", `${loaded.image.width} px`],
        ["Height", `${loaded.image.height} px`],
        ["Aspect ratio", formatNumber(loaded.image.width / loaded.image.height, 3)],
        ["Megapixels", formatNumber((loaded.image.width * loaded.image.height) / 1_000_000, 2)],
        ["Last modified", loaded.file.lastModified ? new Date(loaded.file.lastModified).toLocaleString() : "—"],
        ...Object.entries(exif),
      ]
    : [];

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Image">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4"><Preview src={loaded?.url ?? null} /></div>
          <p className="mt-3 text-xs text-subtle">{PRIVACY} JPEG camera fields are read locally when present.</p>
        </Panel>
        <Panel title="Metadata">
          {rows.length ? (
            <dl className="divide-y divide-line text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium text-ink">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted">Upload an image to inspect dimensions and file details.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

const FAVICON_SIZES = [16, 32, 48, 180, 192, 512];

export function FaviconGenerator({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const snippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;

  async function downloadSize(size: number, name: string) {
    if (!loaded) return;
    const canvas = drawImage(loaded.image, size, size);
    await downloadCanvas(canvas, name, "image/png");
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Source image">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <p className="mt-3 text-xs text-subtle">A square logo works best. {PRIVACY}</p>
        </Panel>
        <Panel title="Favicon set">
          <div className="flex flex-wrap gap-4">
            {loaded
              ? FAVICON_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => void downloadSize(size, size === 180 ? "apple-touch-icon.png" : `favicon-${size}x${size}.png`)}
                    className="rounded-xl border border-line bg-white p-3 text-center text-xs font-semibold text-ink hover:border-brand"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={loaded.url} alt="" className="mx-auto object-cover" style={{ width: Math.min(size, 64), height: Math.min(size, 64) }} />
                    <span className="mt-2 block">{size}×{size}</span>
                  </button>
                ))
              : <p className="text-sm text-muted">Upload a logo to generate PNG favicons.</p>}
          </div>
          <PrimaryButton
            className="mt-4"
            disabled={!loaded}
            onClick={async () => {
              if (!loaded) return;
              const canvas = drawImage(loaded.image, 32, 32);
              const png = await canvasToBlob(canvas, "image/png");
              const ico = await pngToIco(png, 32);
              downloadBlob(ico, "favicon.ico");
            }}
          >
            Download favicon.ico
          </PrimaryButton>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">HTML snippet</p>
              <CopyButton text={snippet} />
            </div>
            <pre className="overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{snippet}</pre>
          </div>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function ImageDimensionChecker({ tool }: { tool: Tool }) {
  const { loaded, error, onFile } = useLoadedImage();
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const ratio = loaded ? gcd(loaded.image.width, loaded.image.height) : 1;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Image">
          <FilePicker onFile={(file) => void onFile(file)} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-4"><Preview src={loaded?.url ?? null} /></div>
        </Panel>
        <ResultCard
          title="Dimensions"
          value={loaded ? `${loaded.image.width} × ${loaded.image.height}` : "—"}
          subtitle={loaded ? "pixels" : undefined}
        >
          {loaded ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Aspect" value={`${loaded.image.width / ratio}:${loaded.image.height / ratio}`} />
              <Stat label="Megapixels" value={formatNumber((loaded.image.width * loaded.image.height) / 1_000_000, 2)} />
              <Stat label="File size" value={formatBytes(loaded.file.size)} />
              <Stat label="Type" value={loaded.file.type || "image"} />
            </div>
          ) : null}
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
