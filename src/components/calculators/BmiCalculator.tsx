"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { clamp, formatNumber, parseNumber } from "@/lib/utils";
import { AffixInput, Field, Panel, PrimaryButton, ResetButton, ResultCard, Segmented } from "./fields";

const categories = [
  { label: "Underweight", range: "< 18.5", color: "bg-sky-400", min: 0, max: 18.5 },
  { label: "Normal weight", range: "18.5 – 24.9", color: "bg-emerald-400", min: 18.5, max: 25 },
  { label: "Overweight", range: "25 – 29.9", color: "bg-amber-400", min: 25, max: 30 },
  { label: "Obese", range: "≥ 30", color: "bg-rose-400", min: 30, max: 60 },
];

function classify(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", tone: "text-sky-600" };
  if (bmi < 25) return { label: "Normal weight", tone: "text-emerald-600" };
  if (bmi < 30) return { label: "Overweight", tone: "text-amber-600" };
  return { label: "Obese", tone: "text-rose-600" };
}

export function BmiCalculator({ tool }: { tool: Tool }) {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [result, setResult] = useState<number | null>(22.9);

  const weightKg = useMemo(() => {
    const value = parseNumber(weight);
    if (value == null) return null;
    return unit === "metric" ? value : value * 0.453592;
  }, [unit, weight]);

  const heightCm = useMemo(() => {
    if (unit === "metric") return parseNumber(height);
    const ft = parseNumber(feet) ?? 0;
    const inch = parseNumber(inches) ?? 0;
    return (ft * 12 + inch) * 2.54;
  }, [unit, height, feet, inches]);

  function calculate() {
    if (weightKg == null || heightCm == null || heightCm <= 0) {
      setResult(null);
      return;
    }
    const meters = heightCm / 100;
    setResult(weightKg / (meters * meters));
  }

  function reset() {
    setWeight("70");
    setHeight("175");
    setFeet("5");
    setInches("9");
    setResult(22.9);
    setUnit("metric");
  }

  const status = result != null ? classify(result) : null;
  const marker = result != null ? clamp(((result - 12) / (40 - 12)) * 100, 2, 98) : 38;

  return (
    <ToolPageLayout
      tool={tool}
      illustration={<ScaleArt />}
      extra={
        <section className="mt-4 rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-ink">BMI Categories</h2>
          <div className="mt-4 divide-y divide-line">
            {categories.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-ink">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </span>
                <span className="text-muted">{item.range}</span>
              </div>
            ))}
          </div>
        </section>
      }
      example={
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">Example</p>
          <p className="mt-1 text-sm text-muted">If you weigh 70 kg and your height is 175 cm:</p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li>1. Enter 70 in the weight field (kg)</li>
            <li>2. Enter 175 in the height field (cm)</li>
            <li>3. Click Calculate BMI</li>
          </ol>
          <p className="mt-3 text-sm font-medium text-brand">Your BMI will be 22.9 (Normal weight).</p>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Enter Your Details">
          <Segmented
            value={unit}
            onChange={setUnit}
            options={[
              { value: "metric", label: "Metric (kg, cm)" },
              { value: "imperial", label: "Imperial (lb, ft)" },
            ]}
          />
          <div className="mt-5 space-y-4">
            <Field label="Weight">
              <AffixInput
                suffix={unit === "metric" ? "kg" : "lb"}
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                inputMode="decimal"
              />
            </Field>
            {unit === "metric" ? (
              <Field label="Height">
                <AffixInput
                  suffix="cm"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  inputMode="decimal"
                />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height (ft)">
                  <AffixInput suffix="ft" value={feet} onChange={(event) => setFeet(event.target.value)} />
                </Field>
                <Field label="Height (in)">
                  <AffixInput suffix="in" value={inches} onChange={(event) => setInches(event.target.value)} />
                </Field>
              </div>
            )}
            <PrimaryButton onClick={calculate}>Calculate BMI</PrimaryButton>
            <ResetButton onClick={reset}>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </span>
            </ResetButton>
          </div>
        </Panel>

        <ResultCard
          title="Your Result"
          value={result != null ? formatNumber(result, 1) : "—"}
          subtitle={status?.label}
        >
          <div className="relative mt-8">
            <div className="flex h-2 overflow-hidden rounded-full">
              <div className="flex-1 bg-sky-400" />
              <div className="flex-[1.2] bg-emerald-400" />
              <div className="flex-1 bg-amber-400" />
              <div className="flex-1 bg-rose-400" />
            </div>
            <span
              className="absolute -top-2 h-0 w-0 -translate-x-1/2 border-x-6 border-t-8 border-x-transparent border-t-slate-700"
              style={{ left: `${marker}%`, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8 }}
            />
            <div className="mt-3 flex justify-between text-[11px] text-subtle">
              <span>Underweight &lt; 18.5</span>
              <span>Normal 18.5–24.9</span>
              <span>Overweight 25–29.9</span>
              <span>Obese ≥ 30</span>
            </div>
          </div>
          {result != null && result >= 18.5 && result < 25 ? (
            <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Your BMI is within the normal range. Keep up the good work!
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat label="Weight" value={unit === "metric" ? `${weight || "—"} kg` : `${weight || "—"} lb`} />
            <Stat label="Height" value={unit === "metric" ? `${height || "—"} cm` : `${feet}'${inches}"`} />
            <Stat label="BMI" value={result != null ? formatNumber(result, 1) : "—"} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ScaleArt() {
  return (
    <div className="hidden h-36 w-44 items-center justify-center rounded-3xl bg-blue-50 lg:flex">
      <svg viewBox="0 0 160 120" className="h-24 w-32 text-blue-400" fill="none">
        <rect x="38" y="38" width="84" height="54" rx="16" stroke="currentColor" strokeWidth="4" />
        <circle cx="80" cy="65" r="10" fill="currentColor" />
        <path d="M20 92h120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M118 28h22M129 17v22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
