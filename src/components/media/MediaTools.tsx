"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Field, Panel, PrimaryButton, SelectInput, TextInput } from "@/components/calculators/fields";
import { FileDrop, FileMeta } from "@/components/converters/shared";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import {
  assertDuration,
  assertVideoSize,
  convertVideoFile,
  downloadVideo,
  extensionForMime,
  formatBytes,
  gifToVideo,
  loadVideoFile,
  MAX_ENCODE_SECONDS,
  MAX_GIF_SECONDS,
  measureFps,
  parseMp4Meta,
  pickRecorderMime,
  videoToGif,
  type LoadedVideo,
} from "@/lib/media/video";
import type { Tool } from "@/lib/types";

const PRIVACY = "The clip stays on this device. We do not get a copy.";

function useBusy() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process this file.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, progress, setProgress, setError, run };
}

function VideoPreview({ url }: { url: string | null }) {
  if (!url) return <p className="text-sm text-muted">Choose a file to preview it here.</p>;
  return (
    <video src={url} controls playsInline className="max-h-80 w-full rounded-xl bg-slate-950" />
  );
}

function ProgressBar({ value, busy }: { value: number; busy: boolean }) {
  if (!busy) return null;
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full bg-brand transition-all" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

function fitSize(width: number, height: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(2, Math.round((width * scale) / 2) * 2),
    height: Math.max(2, Math.round((height * scale) / 2) * 2),
  };
}

function VideoWorkbench({
  tool,
  children,
}: {
  tool: Tool;
  children: (ctx: {
    loaded: LoadedVideo | null;
    setLoaded: (next: LoadedVideo | null) => void;
    busy: boolean;
    error: string;
    progress: number;
    setProgress: (value: number) => void;
    run: (task: () => Promise<void>) => Promise<void>;
    setError: (value: string) => void;
  }) => ReactNode;
}) {
  const [loaded, setLoaded] = useState<LoadedVideo | null>(null);
  const { busy, error, progress, setProgress, setError, run } = useBusy();

  useEffect(() => {
    return () => {
      if (loaded) URL.revokeObjectURL(loaded.url);
    };
  }, [loaded]);

  return (
    <ToolPageLayout tool={tool}>
      {children({
        loaded,
        setLoaded: (next) => {
          if (loaded) URL.revokeObjectURL(loaded.url);
          setLoaded(next);
        },
        busy,
        error,
        progress,
        setProgress,
        run,
        setError,
      })}
      <p className="mt-4 text-xs text-subtle">{PRIVACY} Short clips work best — encoding time is close to the video length.</p>
    </ToolPageLayout>
  );
}

export function VideoCompressor({ tool }: { tool: Tool }) {
  const [preset, setPreset] = useState("medium");

  return (
    <VideoWorkbench tool={tool}>
      {({ loaded, setLoaded, busy, error, progress, setProgress, run, setError }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Compress video">
            <FileDrop
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              hint="One video, up to 80 MB and 3 minutes"
              onFiles={([file]) =>
                void (async () => {
                  try {
                    assertVideoSize(file);
                    setLoaded(await loadVideoFile(file));
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read this video.");
                  }
                })()
              }
            />
            <FileMeta file={loaded?.file ?? null} />
            <div className="mt-4">
              <Field label="Quality">
                <SelectInput value={preset} onChange={(event) => setPreset(event.target.value)}>
                  <option value="high">High — larger file</option>
                  <option value="medium">Medium — balanced</option>
                  <option value="low">Low — smallest file</option>
                </SelectInput>
              </Field>
            </div>
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            <ProgressBar value={progress} busy={busy} />
            <PrimaryButton
              className="mt-4"
              disabled={!loaded || busy}
              onClick={() =>
                void run(async () => {
                  if (!loaded) return;
                  assertDuration(loaded.video);
                  const maxSide = preset === "high" ? 1280 : preset === "medium" ? 854 : 640;
                  const bits = preset === "high" ? 2_800_000 : preset === "medium" ? 1_200_000 : 500_000;
                  const size = fitSize(loaded.video.videoWidth, loaded.video.videoHeight, maxSide);
                  const blob = await convertVideoFile({
                    loaded,
                    ...size,
                    target: pickRecorderMime("webm") ? "webm" : "mp4",
                    videoBitsPerSecond: bits,
                    onProgress: setProgress,
                  });
                  downloadVideo(blob, `${loaded.file.name.replace(/\.[^.]+$/, "")}-compressed`, blob.type);
                })
              }
            >
              {busy ? "Compressing…" : "Download compressed video"}
            </PrimaryButton>
          </Panel>
          <Panel title="Preview">
            <VideoPreview url={loaded?.url ?? null} />
            {loaded ? (
              <p className="mt-3 text-sm text-muted">
                {loaded.video.videoWidth} × {loaded.video.videoHeight} · {loaded.video.duration.toFixed(1)}s
              </p>
            ) : null}
          </Panel>
        </div>
      )}
    </VideoWorkbench>
  );
}

export function VideoResizer({ tool }: { tool: Tool }) {
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [lock, setLock] = useState(true);

  return (
    <VideoWorkbench tool={tool}>
      {({ loaded, setLoaded, busy, error, progress, setProgress, run, setError }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Resize video">
            <FileDrop
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              hint="One video, up to 80 MB and 3 minutes"
              onFiles={([file]) =>
                void (async () => {
                  try {
                    assertVideoSize(file);
                    const next = await loadVideoFile(file);
                    setLoaded(next);
                    setWidth(next.video.videoWidth);
                    setHeight(next.video.videoHeight);
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read this video.");
                  }
                })()
              }
            />
            <FileMeta file={loaded?.file ?? null} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Width">
                <TextInput
                  type="number"
                  min={16}
                  value={width}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setWidth(next);
                    if (lock && loaded) {
                      const ratio = loaded.video.videoHeight / loaded.video.videoWidth;
                      setHeight(Math.max(2, Math.round((next * ratio) / 2) * 2));
                    }
                  }}
                />
              </Field>
              <Field label="Height">
                <TextInput
                  type="number"
                  min={16}
                  value={height}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setHeight(next);
                    if (lock && loaded) {
                      const ratio = loaded.video.videoWidth / loaded.video.videoHeight;
                      setWidth(Math.max(2, Math.round((next * ratio) / 2) * 2));
                    }
                  }}
                />
              </Field>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={lock} onChange={(event) => setLock(event.target.checked)} />
              Keep aspect ratio
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "1080p", w: 1920, h: 1080 },
                { label: "720p", w: 1280, h: 720 },
                { label: "480p", w: 854, h: 480 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-slate-50"
                  onClick={() => {
                    if (!loaded) {
                      setWidth(preset.w);
                      setHeight(preset.h);
                      return;
                    }
                    const size = fitSize(loaded.video.videoWidth, loaded.video.videoHeight, Math.max(preset.w, preset.h));
                    setWidth(size.width);
                    setHeight(size.height);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            <ProgressBar value={progress} busy={busy} />
            <PrimaryButton
              className="mt-4"
              disabled={!loaded || busy}
              onClick={() =>
                void run(async () => {
                  if (!loaded) return;
                  assertDuration(loaded.video);
                  const blob = await convertVideoFile({
                    loaded,
                    width,
                    height,
                    target: pickRecorderMime("webm") ? "webm" : "mp4",
                    onProgress: setProgress,
                  });
                  downloadVideo(blob, `${loaded.file.name.replace(/\.[^.]+$/, "")}-${width}x${height}`, blob.type);
                })
              }
            >
              {busy ? "Resizing…" : "Download resized video"}
            </PrimaryButton>
          </Panel>
          <Panel title="Preview">
            <VideoPreview url={loaded?.url ?? null} />
          </Panel>
        </div>
      )}
    </VideoWorkbench>
  );
}

export function VideoToGif({ tool }: { tool: Tool }) {
  const [seconds, setSeconds] = useState(4);

  return (
    <VideoWorkbench tool={tool}>
      {({ loaded, setLoaded, busy, error, progress, setProgress, run, setError }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Video to GIF">
            <FileDrop
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              hint={`Uses the first ${MAX_GIF_SECONDS} seconds`}
              onFiles={([file]) =>
                void (async () => {
                  try {
                    assertVideoSize(file);
                    setLoaded(await loadVideoFile(file));
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read this video.");
                  }
                })()
              }
            />
            <FileMeta file={loaded?.file ?? null} />
            <div className="mt-4">
              <Field label={`Seconds ${seconds}`}>
                <input
                  type="range"
                  min={1}
                  max={MAX_GIF_SECONDS}
                  value={seconds}
                  onChange={(event) => setSeconds(Number(event.target.value))}
                  className="mt-2 w-full accent-brand"
                />
              </Field>
            </div>
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            <ProgressBar value={progress} busy={busy} />
            <PrimaryButton
              className="mt-4"
              disabled={!loaded || busy}
              onClick={() =>
                void run(async () => {
                  if (!loaded) return;
                  const blob = await videoToGif({
                    video: loaded.video,
                    seconds,
                    onProgress: setProgress,
                  });
                  downloadVideo(blob, loaded.file.name, "image/gif");
                })
              }
            >
              {busy ? "Building GIF…" : "Download GIF"}
            </PrimaryButton>
          </Panel>
          <Panel title="Preview">
            <VideoPreview url={loaded?.url ?? null} />
          </Panel>
        </div>
      )}
    </VideoWorkbench>
  );
}

export function GifToVideo({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const { busy, error, progress, setProgress, setError, run } = useBusy();

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="GIF to video">
          <FileDrop
            accept="image/gif,.gif"
            hint="Animated GIF, up to 20 MB"
            onFiles={([next]) => {
              if (url) URL.revokeObjectURL(url);
              setFile(next);
              setUrl(URL.createObjectURL(next));
              setError("");
            }}
          />
          <FileMeta file={file} />
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <ProgressBar value={progress} busy={busy} />
          <PrimaryButton
            className="mt-4"
            disabled={!file || busy}
            onClick={() =>
              void run(async () => {
                if (!file) return;
                const blob = await gifToVideo(file, setProgress);
                downloadVideo(blob, file.name, blob.type);
              })
            }
          >
            {busy ? "Recording video…" : "Download video"}
          </PrimaryButton>
          <p className="mt-3 text-xs text-subtle">{PRIVACY} Output is WebM in most browsers, or MP4 if the browser can encode it.</p>
        </Panel>
        <Panel title="Preview">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="GIF preview" className="max-h-80 w-full rounded-xl object-contain" />
          ) : (
            <p className="text-sm text-muted">Choose a GIF to preview it here.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

function FormatConvertPanel({
  tool,
  target,
  accept,
}: {
  tool: Tool;
  target: "webm" | "mp4" | "choose";
  accept?: string;
}) {
  const [choice, setChoice] = useState<"webm" | "mp4">(target === "mp4" ? "mp4" : "webm");

  return (
    <VideoWorkbench tool={tool}>
      {({ loaded, setLoaded, busy, error, progress, setProgress, run, setError }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Convert video">
            <FileDrop
              accept={accept ?? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"}
              hint={`Up to 80 MB and ${MAX_ENCODE_SECONDS} seconds`}
              onFiles={([file]) =>
                void (async () => {
                  try {
                    assertVideoSize(file);
                    setLoaded(await loadVideoFile(file));
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read this video.");
                  }
                })()
              }
            />
            <FileMeta file={loaded?.file ?? null} />
            {target === "choose" ? (
              <div className="mt-4">
                <Field label="Convert to">
                  <SelectInput value={choice} onChange={(event) => setChoice(event.target.value as "webm" | "mp4")}>
                    <option value="webm">WebM</option>
                    <option value="mp4">MP4</option>
                  </SelectInput>
                </Field>
              </div>
            ) : null}
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            <ProgressBar value={progress} busy={busy} />
            <PrimaryButton
              className="mt-4"
              disabled={!loaded || busy}
              onClick={() =>
                void run(async () => {
                  if (!loaded) return;
                  assertDuration(loaded.video);
                  const next = target === "choose" ? choice : target;
                  const blob = await convertVideoFile({
                    loaded,
                    width: loaded.video.videoWidth,
                    height: loaded.video.videoHeight,
                    target: next,
                    onProgress: setProgress,
                  });
                  downloadVideo(blob, loaded.file.name, blob.type);
                })
              }
            >
              {busy ? "Converting…" : `Convert to ${extensionForMime(target === "choose" ? choice : target).toUpperCase()}`}
            </PrimaryButton>
          </Panel>
          <Panel title="Preview">
            <VideoPreview url={loaded?.url ?? null} />
          </Panel>
        </div>
      )}
    </VideoWorkbench>
  );
}

export function VideoFormatConverter({ tool }: { tool: Tool }) {
  return <FormatConvertPanel tool={tool} target="choose" />;
}

export function Mp4ToWebm({ tool }: { tool: Tool }) {
  return <FormatConvertPanel tool={tool} target="webm" accept="video/mp4,.mp4" />;
}

export function WebmToMp4({ tool }: { tool: Tool }) {
  return <FormatConvertPanel tool={tool} target="mp4" accept="video/webm,.webm" />;
}

export function VideoFpsChecker({ tool }: { tool: Tool }) {
  const [result, setResult] = useState<string>("");

  return (
    <VideoWorkbench tool={tool}>
      {({ loaded, setLoaded, busy, error, run, setError }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="FPS check">
            <FileDrop
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              hint="Plays a short sample in this tab"
              onFiles={([file]) =>
                void (async () => {
                  try {
                    assertVideoSize(file);
                    setLoaded(await loadVideoFile(file));
                    setResult("");
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read this video.");
                  }
                })()
              }
            />
            <FileMeta file={loaded?.file ?? null} />
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            <PrimaryButton
              className="mt-4"
              disabled={!loaded || busy}
              onClick={() =>
                void run(async () => {
                  if (!loaded) return;
                  const fps = await measureFps(loaded.video, 2);
                  const mp4 = loaded.file.name.toLowerCase().endsWith(".mp4")
                    ? parseMp4Meta(await loaded.file.slice(0, 2 * 1024 * 1024).arrayBuffer())
                    : {};
                  setResult(
                    [
                      fps ? `Measured playback: ${fps.toFixed(2)} fps` : "This browser could not count frames with requestVideoFrameCallback.",
                      mp4.timescale ? `MP4 timescale: ${mp4.timescale}` : "",
                      mp4.brand ? `Brand: ${mp4.brand}` : "",
                    ]
                      .filter(Boolean)
                      .join("\n"),
                  );
                })
              }
            >
              {busy ? "Measuring…" : "Check FPS"}
            </PrimaryButton>
            {result ? <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{result}</pre> : null}
          </Panel>
          <Panel title="Preview">
            <VideoPreview url={loaded?.url ?? null} />
          </Panel>
        </div>
      )}
    </VideoWorkbench>
  );
}

export function VideoMetadataViewer({ tool }: { tool: Tool }) {
  const [extra, setExtra] = useState<Record<string, string | number>>({});

  const rows = useMemo(() => extra, [extra]);

  return (
    <VideoWorkbench tool={tool}>
      {({ loaded, setLoaded, setError }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Video file">
            <FileDrop
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              hint="Nothing is uploaded"
              onFiles={([file]) =>
                void (async () => {
                  try {
                    const next = await loadVideoFile(file);
                    setLoaded(next);
                    const parsed = file.name.toLowerCase().endsWith(".mp4")
                      ? parseMp4Meta(await file.slice(0, 2 * 1024 * 1024).arrayBuffer())
                      : {};
                    setExtra({
                      Name: file.name,
                      Type: file.type || "unknown",
                      Size: formatBytes(file.size),
                      Width: next.video.videoWidth,
                      Height: next.video.videoHeight,
                      Duration: `${next.video.duration.toFixed(2)} s`,
                      ...parsed,
                    });
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read this video.");
                    setExtra({});
                  }
                })()
              }
            />
            <FileMeta file={loaded?.file ?? null} />
            {Object.keys(rows).length ? (
              <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
                {Object.entries(rows).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-4 py-2 text-sm">
                    <dt className="text-muted">{key}</dt>
                    <dd className="font-medium text-ink">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted">Choose a video to see size, duration and dimensions.</p>
            )}
          </Panel>
          <Panel title="Preview">
            <VideoPreview url={loaded?.url ?? null} />
          </Panel>
        </div>
      )}
    </VideoWorkbench>
  );
}
