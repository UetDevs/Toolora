import { downloadBlob } from "@/lib/image/canvas";

export const CONVERTER_LIMIT = 20 * 1024 * 1024;

export function stemName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "file";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function assertFileSize(file: File, limit = CONVERTER_LIMIT) {
  if (file.size > limit) {
    throw new Error(`This file is ${formatBytes(file.size)}. Keep it under ${formatBytes(limit)}.`);
  }
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime: string) {
  downloadBlob(new Blob([bytes as BlobPart], { type: mime }), filename);
}

export function downloadText(text: string, filename: string, mime = "text/plain;charset=utf-8") {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

export function toWinAnsi(text: string) {
  return text.replace(/[^\x00-\x7E]/g, (char) => {
    const map: Record<string, string> = {
      "—": "-",
      "–": "-",
      "‘": "'",
      "’": "'",
      "“": '"',
      "”": '"',
      "…": "...",
      "•": "-",
    };
    return map[char] ?? "?";
  });
}
