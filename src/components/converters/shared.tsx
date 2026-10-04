"use client";

import { useState } from "react";
import { Check, Copy, Upload } from "lucide-react";
import { formatBytes } from "@/lib/converters/files";

export function FileDrop({
  accept,
  multiple,
  hint,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  hint: string;
  onFiles: (files: File[]) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-brand hover:bg-blue-50">
      <Upload className="h-6 w-6 text-brand" />
      <span className="mt-2 text-sm font-semibold text-ink">Choose a file</span>
      <span className="mt-1 text-xs text-subtle">{hint}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
        }}
      />
    </label>
  );
}

export function FileMeta({ file }: { file: File | null }) {
  if (!file) return null;
  return (
    <p className="mt-3 text-sm text-muted">
      {file.name} · {formatBytes(file.size)}
    </p>
  );
}

export function CopyButton({ text }: { text: string }) {
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

export function CodeBox({
  value,
  onChange,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      className="min-h-64 w-full rounded-lg border border-line bg-white px-3.5 py-3 font-mono text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
    />
  );
}
