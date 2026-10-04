"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Field, Panel, ResultCard, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import {
  CM_PER_FOOT,
  CM_PER_INCH,
  KG_TO_LB,
  KM_PER_MILE,
  LB_TO_KG,
  LITERS_PER_US_GALLON,
  M_PER_FOOT,
  M_PER_YARD,
  M2_PER_ACRE,
  M2_PER_HECTARE,
  BAR_PER_PSI,
  HP_PER_WATT,
  KG_PER_STONE,
  ML_PER_US_FLOZ,
  celsiusToFahrenheit,
  convertData,
  fahrenheitToCelsius,
  type DataUnit,
} from "@/lib/units/convert";
import { formatNumber, parseNumber } from "@/lib/utils";
import type { Tool } from "@/lib/types";
import { CopyButton } from "./shared";

function PairConvert({
  tool,
  fromLabel,
  toLabel,
  formula,
  convert,
  sample = "1",
  digits = 4,
  reverseHref,
  reverseLabel,
}: {
  tool: Tool;
  fromLabel: string;
  toLabel: string;
  formula: string;
  convert: (value: number) => number;
  sample?: string;
  digits?: number;
  reverseHref?: string;
  reverseLabel?: string;
}) {
  const [value, setValue] = useState(sample);
  const parsed = parseNumber(value);
  const result = parsed == null ? null : convert(parsed);
  const display = result == null ? "—" : formatNumber(result, digits);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Convert ${fromLabel}`}>
          <Field label={fromLabel}>
            <TextInput value={value} inputMode="decimal" onChange={(event) => setValue(event.target.value)} />
          </Field>
          <p className="mt-4 text-sm text-muted">{formula}</p>
          {reverseHref ? (
            <Link href={reverseHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
              <ArrowLeftRight className="h-4 w-4" />
              {reverseLabel ?? `Convert the other way`}
            </Link>
          ) : null}
        </Panel>
        <ResultCard title={toLabel} value={display}>
          <div className="mt-4 flex justify-end">
            <CopyButton text={result == null ? "" : String(result)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function KgToLbs({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Kilograms"
      toLabel="Pounds"
      formula="1 kg = 2.2046226218 lb"
      convert={(value) => value * KG_TO_LB}
      reverseHref="/tools/unit-converters/lbs-to-kg"
      reverseLabel="LBS → KG"
    />
  );
}

export function LbsToKg({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Pounds"
      toLabel="Kilograms"
      formula="1 lb = 0.45359237 kg"
      convert={(value) => value * LB_TO_KG}
      reverseHref="/tools/unit-converters/kg-to-lbs"
      reverseLabel="KG → LBS"
    />
  );
}

export function CmToInches({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Centimeters"
      toLabel="Inches"
      formula="1 inch = 2.54 cm"
      convert={(value) => value / CM_PER_INCH}
      reverseHref="/tools/unit-converters/inches-to-cm"
      reverseLabel="Inches → CM"
    />
  );
}

export function InchesToCm({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Inches"
      toLabel="Centimeters"
      formula="1 inch = 2.54 cm"
      convert={(value) => value * CM_PER_INCH}
      reverseHref="/tools/unit-converters/cm-to-inches"
      reverseLabel="CM → Inches"
    />
  );
}

export function CmToFeet({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Centimeters"
      toLabel="Feet"
      formula="1 foot = 30.48 cm"
      convert={(value) => value / CM_PER_FOOT}
      reverseHref="/tools/unit-converters/feet-to-cm"
      reverseLabel="Feet → CM"
    />
  );
}

export function FeetToCm({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Feet"
      toLabel="Centimeters"
      formula="1 foot = 30.48 cm"
      convert={(value) => value * CM_PER_FOOT}
      reverseHref="/tools/unit-converters/cm-to-feet"
      reverseLabel="CM → Feet"
    />
  );
}

export function KmToMiles({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Kilometers"
      toLabel="Miles"
      formula="1 mile = 1.609344 km"
      convert={(value) => value / KM_PER_MILE}
      reverseHref="/tools/unit-converters/miles-to-km"
      reverseLabel="Miles → KM"
    />
  );
}

export function MilesToKm({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Miles"
      toLabel="Kilometers"
      formula="1 mile = 1.609344 km"
      convert={(value) => value * KM_PER_MILE}
      reverseHref="/tools/unit-converters/km-to-miles"
      reverseLabel="KM → Miles"
    />
  );
}

export function CelsiusToFahrenheit({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Celsius"
      toLabel="Fahrenheit"
      formula="°F = (°C × 9/5) + 32"
      convert={celsiusToFahrenheit}
      sample="0"
      digits={2}
      reverseHref="/tools/unit-converters/fahrenheit-to-celsius"
      reverseLabel="Fahrenheit → Celsius"
    />
  );
}

export function FahrenheitToCelsius({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Fahrenheit"
      toLabel="Celsius"
      formula="°C = (°F − 32) × 5/9"
      convert={fahrenheitToCelsius}
      sample="32"
      digits={2}
      reverseHref="/tools/unit-converters/celsius-to-fahrenheit"
      reverseLabel="Celsius → Fahrenheit"
    />
  );
}

export function MetersToFeet({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Meters"
      toLabel="Feet"
      formula="1 foot = 0.3048 m"
      convert={(value) => value / M_PER_FOOT}
    />
  );
}

export function LitersToGallons({ tool }: { tool: Tool }) {
  return (
    <PairConvert
      tool={tool}
      fromLabel="Liters"
      toLabel="US gallons"
      formula="1 US gallon = 3.785411784 L"
      convert={(value) => value / LITERS_PER_US_GALLON}
    />
  );
}

function DataPair({
  tool,
  from,
  to,
  sample,
  reverseHref,
  reverseLabel,
}: {
  tool: Tool;
  from: DataUnit;
  to: DataUnit;
  sample: string;
  reverseHref: string;
  reverseLabel: string;
}) {
  const [value, setValue] = useState(sample);
  const [base, setBase] = useState<1000 | 1024>(1024);
  const parsed = parseNumber(value);
  const result = parsed == null ? null : convertData(parsed, from, to, base);
  const labels: Record<DataUnit, string> = { B: "Bytes", KB: "Kilobytes", MB: "Megabytes", GB: "Gigabytes" };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Convert ${labels[from]}`}>
          <Field label={labels[from]}>
            <TextInput value={value} inputMode="decimal" onChange={(event) => setValue(event.target.value)} />
          </Field>
          <div className="mt-4">
            <Field label="Size system">
              <SelectInput value={String(base)} onChange={(event) => setBase(Number(event.target.value) as 1000 | 1024)}>
                <option value="1024">Binary — 1024 (KiB / MiB / GiB style)</option>
                <option value="1000">Decimal — 1000 (SI, disk labels)</option>
              </SelectInput>
            </Field>
          </div>
          <Link href={reverseHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
            <ArrowLeftRight className="h-4 w-4" />
            {reverseLabel}
          </Link>
        </Panel>
        <ResultCard title={labels[to]} value={result == null ? "—" : formatNumber(result, 6)}>
          <div className="mt-4 flex justify-end">
            <CopyButton text={result == null ? "" : String(result)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function MegabytesToGigabytes({ tool }: { tool: Tool }) {
  return <DataPair tool={tool} from="MB" to="GB" sample="1024" reverseHref="/tools/unit-converters/gb-to-mb" reverseLabel="GB → MB" />;
}

export function GigabytesToMegabytes({ tool }: { tool: Tool }) {
  return <DataPair tool={tool} from="GB" to="MB" sample="1" reverseHref="/tools/unit-converters/mb-to-gb" reverseLabel="MB → GB" />;
}

export function MphToKmh({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Miles per hour" toLabel="Kilometers per hour" formula="1 mph = 1.609344 km/h" convert={(value) => value * KM_PER_MILE} reverseHref="/tools/unit-converters/kmh-to-mph" reverseLabel="KM/H → MPH" />;
}
export function KmhToMph({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Kilometers per hour" toLabel="Miles per hour" formula="1 km/h = 0.621371 mph" convert={(value) => value / KM_PER_MILE} reverseHref="/tools/unit-converters/mph-to-kmh" reverseLabel="MPH → KM/H" />;
}
export function StoneToKg({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Stone" toLabel="Kilograms" formula="1 st = 6.35029318 kg" convert={(value) => value * KG_PER_STONE} reverseHref="/tools/unit-converters/kg-to-stone" reverseLabel="KG → Stone" />;
}
export function KgToStone({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Kilograms" toLabel="Stone" formula="1 st = 6.35029318 kg" convert={(value) => value / KG_PER_STONE} reverseHref="/tools/unit-converters/stone-to-kg" reverseLabel="Stone → KG" />;
}
export function OzToMl({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="US fluid ounces" toLabel="Milliliters" formula="1 fl oz = 29.5735295625 ml" convert={(value) => value * ML_PER_US_FLOZ} reverseHref="/tools/unit-converters/ml-to-oz" reverseLabel="ML → OZ" />;
}
export function MlToOz({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Milliliters" toLabel="US fluid ounces" formula="1 fl oz = 29.5735295625 ml" convert={(value) => value / ML_PER_US_FLOZ} reverseHref="/tools/unit-converters/oz-to-ml" reverseLabel="OZ → ML" />;
}
export function PsiToBar({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="PSI" toLabel="Bar" formula="1 psi = 0.0689475729 bar" convert={(value) => value * BAR_PER_PSI} reverseHref="/tools/unit-converters/bar-to-psi" reverseLabel="Bar → PSI" />;
}
export function BarToPsi({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Bar" toLabel="PSI" formula="1 bar ≈ 14.5038 psi" convert={(value) => value / BAR_PER_PSI} reverseHref="/tools/unit-converters/psi-to-bar" reverseLabel="PSI → Bar" />;
}
export function WattsToHp({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Watts" toLabel="Horsepower" formula="1 hp = 745.6998716 W" convert={(value) => value * HP_PER_WATT} reverseHref="/tools/unit-converters/hp-to-watts" reverseLabel="HP → Watts" />;
}
export function HpToWatts({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Horsepower" toLabel="Watts" formula="1 hp = 745.6998716 W" convert={(value) => value / HP_PER_WATT} reverseHref="/tools/unit-converters/watts-to-hp" reverseLabel="Watts → HP" />;
}
export function AcresToHectares({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Acres" toLabel="Hectares" formula="1 acre = 0.40468564224 ha" convert={(value) => (value * M2_PER_ACRE) / M2_PER_HECTARE} reverseHref="/tools/unit-converters/hectares-to-acres" reverseLabel="Hectares → Acres" />;
}
export function HectaresToAcres({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Hectares" toLabel="Acres" formula="1 ha = 2.4710538147 acres" convert={(value) => (value * M2_PER_HECTARE) / M2_PER_ACRE} reverseHref="/tools/unit-converters/acres-to-hectares" reverseLabel="Acres → Hectares" />;
}
export function CmToMm({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Centimeters" toLabel="Millimeters" formula="1 cm = 10 mm" convert={(value) => value * 10} reverseHref="/tools/unit-converters/mm-to-cm" reverseLabel="MM → CM" />;
}
export function MmToCm({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Millimeters" toLabel="Centimeters" formula="1 cm = 10 mm" convert={(value) => value / 10} reverseHref="/tools/unit-converters/cm-to-mm" reverseLabel="CM → MM" />;
}
export function YardsToMeters({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Yards" toLabel="Meters" formula="1 yd = 0.9144 m" convert={(value) => value * M_PER_YARD} reverseHref="/tools/unit-converters/meters-to-yards" reverseLabel="Meters → Yards" />;
}
export function MetersToYards({ tool }: { tool: Tool }) {
  return <PairConvert tool={tool} fromLabel="Meters" toLabel="Yards" formula="1 yd = 0.9144 m" convert={(value) => value / M_PER_YARD} reverseHref="/tools/unit-converters/yards-to-meters" reverseLabel="Yards → Meters" />;
}

export function BytesScale({ tool }: { tool: Tool }) {
  const [value, setValue] = useState("1048576");
  const [from, setFrom] = useState<DataUnit>("B");
  const [base, setBase] = useState<1000 | 1024>(1024);
  const parsed = parseNumber(value);
  const units: DataUnit[] = ["B", "KB", "MB", "GB"];

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Digital storage">
          <Field label="Value">
            <TextInput value={value} inputMode="decimal" onChange={(event) => setValue(event.target.value)} />
          </Field>
          <div className="mt-4">
            <Field label="From">
              <SelectInput value={from} onChange={(event) => setFrom(event.target.value as DataUnit)}>
                <option value="B">Bytes</option>
                <option value="KB">Kilobytes</option>
                <option value="MB">Megabytes</option>
                <option value="GB">Gigabytes</option>
              </SelectInput>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Size system">
              <SelectInput value={String(base)} onChange={(event) => setBase(Number(event.target.value) as 1000 | 1024)}>
                <option value="1024">Binary — 1024</option>
                <option value="1000">Decimal — 1000</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <Panel title="Bytes → KB → MB → GB">
          <dl className="divide-y divide-line">
            {units.map((unit) => {
              const next = parsed == null ? null : convertData(parsed, from, unit, base);
              return (
                <div key={unit} className="flex items-center justify-between py-3">
                  <dt className="text-sm text-muted">{unit}</dt>
                  <dd className="font-semibold text-ink">{next == null ? "—" : formatNumber(next, 6)}</dd>
                </div>
              );
            })}
          </dl>
        </Panel>
      </div>
    </ToolPageLayout>
  );
}
