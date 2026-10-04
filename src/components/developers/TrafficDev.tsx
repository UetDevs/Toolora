"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Field, Panel, PrimaryButton, ResultCard, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CopyButton } from "@/components/converters/shared";
import type { Tool } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

function LocalCopy({ text }: { text: string }) {
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

export function QrCodeGenerator({ tool }: { tool: Tool }) {
  const [text, setText] = useState("https://toolora.app");
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");

  async function make() {
    setError("");
    try {
      const QRCode = (await import("qrcode")).default;
      setSrc(await QRCode.toDataURL(text.trim() || " ", { width: 512, margin: 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw a QR code.");
    }
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Content">
          <Field label="URL or text">
            <TextInput value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <PrimaryButton className="mt-4" onClick={() => void make()}>Make QR</PrimaryButton>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </Panel>
        <Panel title="PNG">
          {src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="QR code" className="mx-auto h-56 w-56" />
              <a href={src} download="qr.png" className="mt-4 inline-flex text-sm font-semibold text-brand">Download PNG</a>
            </>
          ) : (
            <p className="text-sm text-muted">Type something and click Make QR.</p>
          )}
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

function randomChars(length: number, alphabet: string) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function PasswordGenerator({ tool }: { tool: Tool }) {
  const [length, setLength] = useState("16");
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const n = Math.min(64, Math.max(6, Number(length) || 16));
  const alphabet = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${symbols ? "!@#$%^&*-_" : ""}`;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Options">
          <Field label="Length"><TextInput value={length} onChange={(e) => setLength(e.target.value)} /></Field>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
            Include symbols
          </label>
          <PrimaryButton className="mt-4" onClick={() => setPassword(randomChars(n, alphabet))}>Generate</PrimaryButton>
        </Panel>
        <Panel title="Password" action={<LocalCopy text={password} />}>
          <p className="break-all text-xl font-semibold text-ink">{password || "—"}</p>
          <p className="mt-3 text-xs text-subtle">Uses this browser’s crypto API. Nothing is sent anywhere.</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

const MONTHS = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");
const DAYS = "SUN MON TUE WED THU FRI SAT".split(" ");

function explainField(value: string, min: number, max: number, names?: string[]) {
  if (value === "*") return `every value from ${min} to ${max}`;
  if (value.startsWith("*/")) return `every ${value.slice(2)}`;
  if (names && Number.isNaN(Number(value))) return names.includes(value.toUpperCase()) ? value.toUpperCase() : value;
  return value;
}

export function CronExplainer({ tool }: { tool: Tool }) {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const parts = expr.trim().split(/\s+/);
  const ok = parts.length === 5;
  const text = ok
    ? `Minute ${explainField(parts[0], 0, 59)}; hour ${explainField(parts[1], 0, 23)}; day-of-month ${explainField(parts[2], 1, 31)}; month ${explainField(parts[3], 1, 12, MONTHS)}; weekday ${explainField(parts[4], 0, 6, DAYS)}.`
    : "Use five fields: minute hour day-of-month month weekday.";

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Expression">
          <Field label="Cron"><TextInput value={expr} onChange={(e) => setExpr(e.target.value)} /></Field>
        </Panel>
        <ResultCard title="In words" value={ok ? parts[1] === "*" ? "hourly+" : parts[1] : "—"} subtitle={text} />
      </div>
    </ToolPageLayout>
  );
}

export function HtaccessGenerator({ tool }: { tool: Tool }) {
  const [from, setFrom] = useState("/old-page");
  const [to, setTo] = useState("/new-page");
  const [code, setCode] = useState("301");
  const line = `Redirect ${code} ${from || "/"} ${to || "/"}`;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Redirect">
          <div className="space-y-4">
            <Field label="From path"><TextInput value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="To URL or path"><TextInput value={to} onChange={(e) => setTo(e.target.value)} /></Field>
            <Field label="Type">
              <SelectInput value={code} onChange={(e) => setCode(e.target.value)}>
                <option value="301">301 permanent</option>
                <option value="302">302 temporary</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <Panel title=".htaccess line" action={<CopyButton text={line} />}>
          <pre className="overflow-auto rounded-lg bg-slate-50 p-4 text-sm">{line}</pre>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function RobotsTxtGenerator({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState("allow");
  const [sitemap, setSitemap] = useState("https://toolora.app/sitemap.xml");
  const text = `User-agent: *\n${mode === "allow" ? "Allow: /" : "Disallow: /"}\nSitemap: ${sitemap}`;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Rules">
          <Field label="Default">
            <SelectInput value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="allow">Allow the whole site</option>
              <option value="block">Block the whole site</option>
            </SelectInput>
          </Field>
          <div className="mt-4">
            <Field label="Sitemap URL"><TextInput value={sitemap} onChange={(e) => setSitemap(e.target.value)} /></Field>
          </div>
        </Panel>
        <Panel title="robots.txt" action={<CopyButton text={text} />}>
          <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{text}</pre>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function CssGradientGenerator({ tool }: { tool: Tool }) {
  const [from, setFrom] = useState("#2563EB");
  const [to, setTo] = useState("#f8fafc");
  const [angle, setAngle] = useState("180");
  const css = `linear-gradient(${angle}deg, ${from}, ${to})`;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Stops">
          <div className="grid grid-cols-2 gap-3">
            <Field label="From"><TextInput type="color" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="To"><TextInput type="color" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Angle"><AffixLike value={angle} onChange={setAngle} /></Field>
          </div>
        </Panel>
        <Panel title="CSS" action={<CopyButton text={`background: ${css};`} />}>
          <div className="h-32 rounded-xl border border-line" style={{ background: css }} />
          <pre className="mt-4 overflow-auto text-sm">background: {css};</pre>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

function AffixLike({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <TextInput value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function BoxShadowGenerator({ tool }: { tool: Tool }) {
  const [x, setX] = useState("0");
  const [y, setY] = useState("12");
  const [blur, setBlur] = useState("24");
  const [color, setColor] = useState("#0f172a33");
  const css = `${x}px ${y}px ${blur}px ${color}`;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Shadow">
          <div className="grid grid-cols-3 gap-3">
            <Field label="X"><TextInput value={x} onChange={(e) => setX(e.target.value)} /></Field>
            <Field label="Y"><TextInput value={y} onChange={(e) => setY(e.target.value)} /></Field>
            <Field label="Blur"><TextInput value={blur} onChange={(e) => setBlur(e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Color"><TextInput value={color} onChange={(e) => setColor(e.target.value)} /></Field>
          </div>
        </Panel>
        <Panel title="CSS" action={<CopyButton text={`box-shadow: ${css};`} />}>
          <div className="h-32 rounded-xl bg-white" style={{ boxShadow: css }} />
          <pre className="mt-4 text-sm">box-shadow: {css};</pre>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

export function RandomStringGenerator({ tool }: { tool: Tool }) {
  const [length, setLength] = useState("21");
  const [set, setSet] = useState("alnum");
  const [value, setValue] = useState("");
  const alphabet = set === "hex" ? "0123456789abcdef" : set === "letters" ? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const n = Math.min(128, Math.max(4, Number(length) || 21));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Options">
          <Field label="Length"><TextInput value={length} onChange={(e) => setLength(e.target.value)} /></Field>
          <div className="mt-4">
            <Field label="Alphabet">
              <SelectInput value={set} onChange={(e) => setSet(e.target.value)}>
                <option value="alnum">Letters and numbers</option>
                <option value="letters">Letters only</option>
                <option value="hex">Hex</option>
              </SelectInput>
            </Field>
          </div>
          <PrimaryButton className="mt-4" onClick={() => setValue(randomChars(n, alphabet))}>Generate</PrimaryButton>
        </Panel>
        <Panel title="String" action={<LocalCopy text={value} />}>
          <p className="break-all text-lg font-semibold">{value || "—"}</p>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const n = Number.parseInt(clean, 16);
  if (!Number.isFinite(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channel(value: number) {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function ContrastChecker({ tool }: { tool: Tool }) {
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const ratio = L1 != null && L2 != null ? (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05) : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Colors">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Text"><TextInput type="color" value={fg} onChange={(e) => setFg(e.target.value)} /></Field>
            <Field label="Background"><TextInput type="color" value={bg} onChange={(e) => setBg(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Contrast" value={ratio == null ? "—" : `${formatNumber(ratio, 2)}:1`}>
          <p className="mt-4 text-sm text-muted">
            {ratio == null ? "Use 6-digit hex." : ratio >= 7 ? "AAA for normal text." : ratio >= 4.5 ? "AA for normal text." : ratio >= 3 ? "AA for large text only." : "Fails WCAG AA."}
          </p>
          <p className="mt-4 rounded-xl p-4 text-sm font-semibold" style={{ color: fg, background: bg }}>Sample sentence on this pair.</p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function NumberBaseConverter({ tool }: { tool: Tool }) {
  const [value, setValue] = useState("255");
  const [from, setFrom] = useState("10");
  const parsed = Number.parseInt(value.trim(), Number(from));
  const ok = Number.isFinite(parsed);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Value">
          <Field label="Number"><TextInput value={value} onChange={(e) => setValue(e.target.value)} /></Field>
          <div className="mt-4">
            <Field label="From base">
              <SelectInput value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="2">Binary</option>
                <option value="8">Octal</option>
                <option value="10">Decimal</option>
                <option value="16">Hex</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <Panel title="Conversions">
          <dl className="divide-y divide-line text-sm">
            {[
              ["Binary", ok ? parsed.toString(2) : "—"],
              ["Octal", ok ? parsed.toString(8) : "—"],
              ["Decimal", ok ? String(parsed) : "—"],
              ["Hex", ok ? parsed.toString(16).toUpperCase() : "—"],
            ].map(([label, next]) => (
              <div key={label} className="flex justify-between py-3">
                <dt className="text-muted">{label}</dt>
                <dd className="font-semibold">{next}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}

