export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

export type LoadedImage = {
  file: File;
  image: HTMLImageElement;
  url: string;
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function extensionFor(mime: ImageFormat) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

export function loadImageFile(file: File) {
  return new Promise<LoadedImage>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => resolve({ file, image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}

export function loadImageSrc(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load this image source."));
    image.src = src;
  });
}

export function drawImage(
  image: CanvasImageSource,
  width: number,
  height: number,
  setup?: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  setup?.(ctx);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: ImageFormat, quality = 0.92) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image."))),
      mime,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, mime: ImageFormat, quality = 0.92) {
  return canvasToBlob(canvas, mime, quality).then((blob) => downloadBlob(blob, filename));
}

export function stemName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "image";
}

export async function pngToIco(png: Blob, size: number) {
  const pngBytes = new Uint8Array(await png.arrayBuffer());
  const header = new ArrayBuffer(22);
  const view = new DataView(header);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  view.setUint8(6, size >= 256 ? 0 : size);
  view.setUint8(7, size >= 256 ? 0 : size);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, pngBytes.byteLength, true);
  view.setUint32(18, 22, true);
  return new Blob([header, pngBytes], { type: "image/x-icon" });
}

type ExifValue = string | number;

export async function readJpegExif(file: File) {
  if (!file.type.includes("jpeg") && !file.name.toLowerCase().endsWith(".jpg") && !file.name.toLowerCase().endsWith(".jpeg")) {
    return {} as Record<string, ExifValue>;
  }
  const buffer = await file.arrayBuffer();
  const bytes = new DataView(buffer);
  if (bytes.byteLength < 4 || bytes.getUint16(0) !== 0xffd8) return {};

  let offset = 2;
  while (offset + 4 < bytes.byteLength) {
    if (bytes.getUint8(offset) !== 0xff) break;
    const marker = bytes.getUint8(offset + 1);
    const size = bytes.getUint16(offset + 2);
    if (marker === 0xe1) {
      return parseExif(buffer.slice(offset + 4, offset + 2 + size));
    }
    offset += 2 + size;
  }
  return {};
}

function parseExif(segment: ArrayBuffer) {
  const data = new DataView(segment);
  if (data.byteLength < 14) return {};
  const header = String.fromCharCode(data.getUint8(0), data.getUint8(1), data.getUint8(2), data.getUint8(3));
  if (header !== "Exif") return {};
  const tiff = 6;
  const little = data.getUint16(tiff) === 0x4949;
  const read16 = (at: number) => data.getUint16(at, little);
  const read32 = (at: number) => data.getUint32(at, little);
  const ifd = tiff + read32(tiff + 4);
  const count = read16(ifd);
  const tags: Record<number, string> = {
    0x010f: "Camera make",
    0x0110: "Camera model",
    0x0112: "Orientation",
    0x0131: "Software",
    0x0132: "Date taken",
  };
  const result: Record<string, ExifValue> = {};
  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12;
    const tag = read16(entry);
    const label = tags[tag];
    if (!label) continue;
    const type = read16(entry + 2);
    const num = read32(entry + 4);
    const valueOffset = entry + 8;
    if (type === 2) {
      const start = num > 4 ? tiff + read32(valueOffset) : valueOffset;
      let text = "";
      for (let n = 0; n < Math.min(num, 80); n += 1) {
        const code = data.getUint8(start + n);
        if (!code) break;
        text += String.fromCharCode(code);
      }
      result[label] = text;
    } else if (type === 3) {
      result[label] = data.getUint16(valueOffset, little);
    } else if (type === 4) {
      result[label] = read32(valueOffset);
    }
  }
  return result;
}
