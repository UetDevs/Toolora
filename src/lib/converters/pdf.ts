import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { downloadBlob } from "@/lib/image/canvas";
import { stemName, toWinAnsi } from "./files";

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsReady: Promise<PdfjsModule> | null = null;

async function loadPdfjs() {
  if (!pdfjsReady) {
    pdfjsReady = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfjsReady;
}

export async function renderPdfPages(file: File, scale = 2) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: { canvas: HTMLCanvasElement; name: string }[] = [];
  const stem = stemName(file.name);

  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    await page.render({ canvas, canvasContext: context, viewport } as Parameters<typeof page.render>[0]).promise;
    pages.push({ canvas, name: `${stem}-page-${index}.jpg` });
  }

  return pages;
}

export async function extractPdfText(file: File) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];

  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    parts.push(line);
  }

  return parts.filter(Boolean).join("\n\n");
}

export async function imagesToPdf(files: File[]) {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const lower = file.name.toLowerCase();
    const isPng = file.type === "image/png" || lower.endsWith(".png");
    const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return pdf.save();
}

export async function textToPdfBytes(text: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 56;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const safe = toWinAnsi(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"));

  const lines: string[] = [];
  for (const paragraph of safe.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
        current = next;
        continue;
      }
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = "";
        for (const char of word) {
          const tryChunk = chunk + char;
          if (font.widthOfTextAtSize(tryChunk, fontSize) > maxWidth) {
            if (chunk) lines.push(chunk);
            chunk = char;
          } else {
            chunk = tryChunk;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  for (const line of lines) {
    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    if (line) {
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.12, 0.16, 0.22),
      });
    }
    y -= lineHeight;
  }

  return pdf.save();
}

export async function extractDocxText(file: File) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.trim();
}

export function wordHtmlDocument(body: string, title: string) {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title></head><body><p>${escaped}</p></body></html>`;
}

export async function mergePdfs(files: File[]) {
  if (files.length < 2) throw new Error("Add at least two PDF files.");
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((page) => out.addPage(page));
  }
  return out.save();
}

export async function splitPdf(file: File, start: number, end: number) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const last = src.getPageCount();
  const from = Math.max(1, Math.min(start, last));
  const to = Math.max(from, Math.min(end, last));
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    src,
    Array.from({ length: to - from + 1 }, (_, index) => from - 1 + index),
  );
  copied.forEach((page) => out.addPage(page));
  return out.save();
}

export async function rotatePdf(file: File, turn: 90 | 180 | 270) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  src.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + turn) % 360));
  });
  return src.save();
}

export async function compressPdf(file: File, quality = 0.62) {
  const pages = await renderPdfPages(file, 1.35);
  const pdf = await PDFDocument.create();
  for (const page of pages) {
    const blob = await new Promise<Blob>((resolve, reject) => {
      page.canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not compress a page."))), "image/jpeg", quality);
    });
    const image = await pdf.embedJpg(await blob.arrayBuffer());
    const next = pdf.addPage([image.width, image.height]);
    next.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return pdf.save();
}

export function downloadCanvasesAsZipFallback(pages: { canvas: HTMLCanvasElement; name: string }[], quality = 0.92) {
  pages.forEach((page, index) => {
    window.setTimeout(() => {
      page.canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, page.name);
      }, "image/jpeg", quality);
    }, index * 250);
  });
}
