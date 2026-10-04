import { downloadBlob } from "@/lib/image/canvas";
import { formatBytes, stemName } from "@/lib/converters/files";

export const VIDEO_LIMIT = 80 * 1024 * 1024;
export const MAX_ENCODE_SECONDS = 180;
export const MAX_GIF_SECONDS = 8;

export type LoadedVideo = {
  file: File;
  video: HTMLVideoElement;
  url: string;
};

export function assertVideoSize(file: File) {
  if (file.size > VIDEO_LIMIT) {
    throw new Error(`This file is ${formatBytes(file.size)}. Keep it under ${formatBytes(VIDEO_LIMIT)}.`);
  }
}

export function pickRecorderMime(kind: "webm" | "mp4" | "any" = "any") {
  const webm = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  const mp4 = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1.42E01E", "video/mp4"];
  const list = kind === "mp4" ? mp4 : kind === "webm" ? webm : [...webm, ...mp4];
  return list.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) ?? "";
}

export function extensionForMime(mime: string) {
  return mime.includes("mp4") ? "mp4" : mime.includes("gif") ? "gif" : "webm";
}

export function loadVideoFile(file: File) {
  return new Promise<LoadedVideo>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve({ file, video, url });
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this video in the browser."));
    };
    video.src = url;
  });
}

export function assertDuration(video: HTMLVideoElement, max = MAX_ENCODE_SECONDS) {
  if (Number.isFinite(video.duration) && video.duration > max) {
    throw new Error(`Keep the clip under ${max} seconds for in-browser encoding.`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForSeek(video: HTMLVideoElement) {
  if (video.seekable.length === 0) return;
  await new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("seeked", done);
      resolve();
    };
    video.addEventListener("seeked", done);
  });
}

export async function recordVideo(options: {
  video: HTMLVideoElement;
  width: number;
  height: number;
  mimeType: string;
  videoBitsPerSecond?: number;
  fps?: number;
  onProgress?: (ratio: number) => void;
}) {
  const { video, width, height, mimeType, videoBitsPerSecond = 1_500_000, fps = 24, onProgress } = options;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.round(width / 2) * 2);
  canvas.height = Math.max(2, Math.round(height / 2) * 2);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  const stream = canvas.captureStream(fps);
  const capture = typeof (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream === "function"
    ? (video as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream()
    : null;
  capture?.getAudioTracks().forEach((track) => stream.addTrack(track));

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
    recorder.onerror = () => reject(new Error("Could not record this video."));
  });

  video.currentTime = 0;
  await waitForSeek(video);
  video.muted = true;
  recorder.start(250);
  await video.play();

  const draw = () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (video.duration) onProgress?.(Math.min(1, video.currentTime / video.duration));
    if (!video.paused && !video.ended) {
      if ("requestVideoFrameCallback" in video) {
        video.requestVideoFrameCallback(draw);
      } else {
        window.requestAnimationFrame(draw);
      }
    }
  };
  draw();

  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });
  await sleep(120);
  if (recorder.state !== "inactive") recorder.stop();
  capture?.getTracks().forEach((track) => track.stop());
  stream.getTracks().forEach((track) => track.stop());
  return stopped;
}

export async function transcodeWithFfmpeg(
  file: File,
  output: "mp4" | "webm",
  onProgress?: (ratio: number) => void,
) {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  ffmpeg.on("progress", ({ progress }) => onProgress?.(Math.min(1, progress)));
  const base = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
  });
  await ffmpeg.writeFile("input", await fetchFile(file));
  const outName = output === "mp4" ? "out.mp4" : "out.webm";
  const args =
    output === "mp4"
      ? ["-i", "input", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-c:a", "aac", "-movflags", "+faststart", outName]
      : ["-i", "input", "-c:v", "libvpx", "-b:v", "1M", "-c:a", "libopus", outName];
  await ffmpeg.exec(args);
  const data = await ffmpeg.readFile(outName);
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  return new Blob([bytes as BlobPart], { type: output === "mp4" ? "video/mp4" : "video/webm" });
}

export async function convertVideoFile(options: {
  loaded: LoadedVideo;
  width: number;
  height: number;
  target: "webm" | "mp4";
  videoBitsPerSecond?: number;
  onProgress?: (ratio: number) => void;
}) {
  const mime = pickRecorderMime(options.target);
  if (mime) {
    return recordVideo({
      video: options.loaded.video,
      width: options.width,
      height: options.height,
      mimeType: mime,
      videoBitsPerSecond: options.videoBitsPerSecond,
      onProgress: options.onProgress,
    });
  }
  if (options.target === "mp4" || options.target === "webm") {
    return transcodeWithFfmpeg(options.loaded.file, options.target, options.onProgress);
  }
  throw new Error("This browser cannot encode that video format.");
}

export async function videoToGif(options: {
  video: HTMLVideoElement;
  maxWidth?: number;
  seconds?: number;
  fps?: number;
  onProgress?: (ratio: number) => void;
}) {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const { video, maxWidth = 360, seconds = MAX_GIF_SECONDS, fps = 8, onProgress } = options;
  const duration = Math.min(Number.isFinite(video.duration) ? video.duration : seconds, seconds);
  const scale = Math.min(1, maxWidth / Math.max(1, video.videoWidth));
  const width = Math.max(2, Math.round((video.videoWidth * scale) / 2) * 2);
  const height = Math.max(2, Math.round((video.videoHeight * scale) / 2) * 2);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available.");

  const gif = GIFEncoder();
  const delay = Math.round(1000 / fps);
  const frames = Math.max(1, Math.floor(duration * fps));

  for (let index = 0; index < frames; index += 1) {
    video.currentTime = Math.min(duration - 0.01, index / fps);
    await waitForSeek(video);
    ctx.drawImage(video, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const palette = quantize(pixels, 256);
    const indexMap = applyPalette(pixels, palette);
    gif.writeFrame(indexMap, width, height, { palette, delay });
    onProgress?.((index + 1) / frames);
  }

  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
}

export async function gifToVideo(file: File, onProgress?: (ratio: number) => void) {
  const { parseGIF, decompressFrames } = await import("gifuct-js");
  const parsed = parseGIF(await file.arrayBuffer());
  const frames = decompressFrames(parsed, true);
  if (!frames.length) throw new Error("No frames were found in this GIF.");

  const width = parsed.lsd.width;
  const height = parsed.lsd.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  const overlay = document.createElement("canvas");
  const overlayCtx = overlay.getContext("2d");
  if (!overlayCtx) throw new Error("Canvas is not available.");

  const mime = pickRecorderMime("any");
  if (!mime) throw new Error("This browser cannot record video from a GIF.");
  const stream = canvas.captureStream(12);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime.split(";")[0] }));
    recorder.onerror = () => reject(new Error("Could not turn this GIF into a video."));
  });

  recorder.start();
  let backup: ImageData | null = null;
  for (const [index, frame] of frames.entries()) {
    if (frame.disposalType === 2 && backup) ctx.putImageData(backup, 0, 0);
    else if (frame.disposalType === 2) ctx.clearRect(0, 0, width, height);
    overlay.width = frame.dims.width;
    overlay.height = frame.dims.height;
    const image = overlayCtx.createImageData(frame.dims.width, frame.dims.height);
    image.data.set(frame.patch);
    overlayCtx.putImageData(image, 0, 0);
    if (frame.disposalType === 2) backup = ctx.getImageData(0, 0, width, height);
    ctx.drawImage(overlay, frame.dims.left, frame.dims.top);
    onProgress?.((index + 1) / frames.length);
    await sleep(Math.max(40, frame.delay || 80));
  }
  await sleep(160);
  if (recorder.state !== "inactive") recorder.stop();
  stream.getTracks().forEach((track) => track.stop());
  return stopped;
}

export function parseMp4Meta(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const result: Record<string, string | number> = {};
  let offset = 0;
  const limit = Math.min(view.byteLength, 2 * 1024 * 1024);

  const readType = (at: number) =>
    String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));

  const walk = (start: number, end: number, depth = 0) => {
    let at = start;
    while (at + 8 <= end && at + 8 <= limit) {
      let size = view.getUint32(at);
      const type = readType(at + 4);
      let header = 8;
      if (size === 1 && at + 16 <= end) {
        size = Number(view.getBigUint64(at + 8));
        header = 16;
      }
      if (size < header) break;
      const next = size === 0 ? end : Math.min(end, at + size);
      if (type === "ftyp" && at + header + 4 <= next) {
        result.brand = readType(at + header);
      }
      if (type === "mdhd" && at + header + 4 <= next) {
        const version = view.getUint8(at + header);
        const timescale = version === 1 ? view.getUint32(at + header + 20) : view.getUint32(at + header + 12);
        result.timescale = timescale;
      }
      if (["moov", "trak", "mdia", "minf", "stbl"].includes(type)) {
        walk(at + header, next, depth + 1);
      }
      at = next;
      if (size === 0) break;
    }
  };

  walk(0, limit);
  return result;
}

export async function measureFps(video: HTMLVideoElement, seconds = 2) {
  if (!("requestVideoFrameCallback" in video)) {
    return null;
  }
  video.currentTime = 0;
  await waitForSeek(video);
  await video.play();
  let frames = 0;
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const step: VideoFrameRequestCallback = (_now, meta) => {
      frames += 1;
      const elapsed = (meta.mediaTime || (performance.now() - start) / 1000);
      if (elapsed >= seconds || video.ended) {
        video.pause();
        resolve();
        return;
      }
      video.requestVideoFrameCallback(step);
    };
    video.requestVideoFrameCallback(step);
  });
  const elapsed = Math.max(0.001, Math.min(seconds, video.currentTime || seconds));
  return frames / elapsed;
}

export function downloadVideo(blob: Blob, name: string, mime: string) {
  const ext = extensionForMime(mime || blob.type);
  downloadBlob(blob, `${stemName(name)}.${ext}`);
}

export { formatBytes, stemName };
