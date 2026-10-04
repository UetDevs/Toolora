"use client";

import { useMemo, useState } from "react";
import { AffixInput, Field, Panel, ResultCard, SelectInput, TextInput } from "@/components/calculators/fields";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { formatNumber, parseNumber } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function money(value: number | null) {
  return value == null ? "—" : `$${formatNumber(value)}`;
}

export function MortgageCalculator({ tool }: { tool: Tool }) {
  const [price, setPrice] = useState("350000");
  const [down, setDown] = useState("70000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const home = parseNumber(price);
  const deposit = parseNumber(down) ?? 0;
  const annual = parseNumber(rate);
  const term = parseNumber(years);
  const principal = home != null ? Math.max(home - deposit, 0) : null;
  let payment: number | null = null;
  let total: number | null = null;
  if (principal != null && annual != null && term && term > 0) {
    const monthlyRate = annual / 100 / 12;
    const n = term * 12;
    payment = monthlyRate === 0 ? principal / n : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    total = payment * n;
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Loan">
          <div className="space-y-4">
            <Field label="Home price"><AffixInput suffix="$" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Down payment"><AffixInput suffix="$" value={down} onChange={(e) => setDown(e.target.value)} /></Field>
            <Field label="Annual rate"><AffixInput suffix="%" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Term"><AffixInput suffix="years" value={years} onChange={(e) => setYears(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Monthly payment" value={money(payment)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Borrowed" value={money(principal)} />
            <Stat label="Total interest" value={money(total != null && principal != null ? total - principal : null)} />
          </div>
          <p className="mt-4 text-xs text-subtle">This is a plain amortization. Taxes and insurance are not included.</p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

const TAX_PRESETS = [
  { id: "pk18", label: "Pakistan GST 18%", rate: 18 },
  { id: "in18", label: "India GST 18%", rate: 18 },
  { id: "in5", label: "India GST 5%", rate: 5 },
  { id: "uk20", label: "UK VAT 20%", rate: 20 },
  { id: "ae5", label: "UAE VAT 5%", rate: 5 },
  { id: "custom", label: "Custom rate", rate: 10 },
];

export function GstCalculator({ tool }: { tool: Tool }) {
  const [preset, setPreset] = useState("pk18");
  const [custom, setCustom] = useState("10");
  const [amount, setAmount] = useState("1000");
  const [mode, setMode] = useState("add");
  const rate = preset === "custom" ? parseNumber(custom) : TAX_PRESETS.find((item) => item.id === preset)?.rate;
  const net = parseNumber(amount);
  const tax = net != null && rate != null ? (mode === "add" ? (net * rate) / 100 : net - net / (1 + rate / 100)) : null;
  const gross = net != null && tax != null ? (mode === "add" ? net + tax : net) : null;
  const base = net != null && tax != null ? (mode === "add" ? net : net - tax) : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Amount">
          <div className="space-y-4">
            <Field label="Preset">
              <SelectInput value={preset} onChange={(e) => setPreset(e.target.value)}>
                {TAX_PRESETS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </SelectInput>
            </Field>
            {preset === "custom" ? (
              <Field label="Rate"><AffixInput suffix="%" value={custom} onChange={(e) => setCustom(e.target.value)} /></Field>
            ) : null}
            <Field label={mode === "add" ? "Price before tax" : "Price including tax"}>
              <TextInput value={amount} inputMode="decimal" onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Mode">
              <SelectInput value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="add">Add tax</option>
                <option value="extract">Tax is already in the price</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Tax" value={tax == null ? "—" : formatNumber(tax)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Before tax" value={base == null ? "—" : formatNumber(base)} />
            <Stat label="With tax" value={gross == null ? "—" : formatNumber(gross)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

const ZONES = [
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Australia/Sydney",
  "UTC",
];

function zoneLabel(zone: string) {
  return zone.replace(/_/g, " ").replace("/", " · ");
}

export function TimezoneConverter({ tool }: { tool: Tool }) {
  const [from, setFrom] = useState("Asia/Karachi");
  const [to, setTo] = useState("America/New_York");
  const [when, setWhen] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const result = useMemo(() => {
    const local = new Date(when);
    if (Number.isNaN(local.getTime())) return null;
    const asFrom = new Date(local.toLocaleString("en-US", { timeZone: from }));
    const shift = local.getTime() - asFrom.getTime();
    const utc = new Date(local.getTime() + shift);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: to,
      dateStyle: "full",
      timeStyle: "short",
    }).format(utc);
  }, [from, to, when]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="From / to">
          <div className="space-y-4">
            <Field label="Date and time">
              <TextInput type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </Field>
            <Field label="This time is in">
              <SelectInput value={from} onChange={(e) => setFrom(e.target.value)}>
                {ZONES.map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
              </SelectInput>
            </Field>
            <Field label="Show it in">
              <SelectInput value={to} onChange={(e) => setTo(e.target.value)}>
                {ZONES.map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title={zoneLabel(to)} value={result ? result.split(" at ")[1] ?? "—" : "—"} subtitle={result ?? undefined} />
      </div>
    </ToolPageLayout>
  );
}

export function SleepCalculator({ tool }: { tool: Tool }) {
  const [wake, setWake] = useState("07:00");
  const cycles = [6, 5, 4].map((count) => {
    const [h, m] = wake.split(":").map(Number);
    const minutes = h * 60 + m - count * 90 - 15;
    const wrapped = ((minutes % 1440) + 1440) % 1440;
    return { count, label: `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}` };
  });

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Wake time">
          <Field label="I need to wake at"><TextInput type="time" value={wake} onChange={(e) => setWake(e.target.value)} /></Field>
          <p className="mt-4 text-sm text-muted">Assumes 15 minutes to fall asleep and 90-minute cycles. People vary.</p>
        </Panel>
        <ResultCard title="Try going to bed at" value={cycles[0].label}>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {cycles.map((item) => (
              <Stat key={item.count} label={`${item.count} cycles`} value={item.label} />
            ))}
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PregnancyDueDate({ tool }: { tool: Tool }) {
  const [lmp, setLmp] = useState(() => new Date().toISOString().slice(0, 10));
  const due = addDays(lmp, 280);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Last period">
          <Field label="First day of last period"><TextInput type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} /></Field>
          <p className="mt-4 text-sm text-muted">Naegele’s rule: 280 days from that date. A clinician may date it differently.</p>
        </Panel>
        <ResultCard title="Estimated due date" value={due ?? "—"} />
      </div>
    </ToolPageLayout>
  );
}

export function OvulationCalculator({ tool }: { tool: Tool }) {
  const [lmp, setLmp] = useState(() => new Date().toISOString().slice(0, 10));
  const [cycle, setCycle] = useState("28");
  const length = parseNumber(cycle) ?? 28;
  const ovulation = addDays(lmp, Math.max(length - 14, 8));
  const fertileStart = addDays(lmp, Math.max(length - 18, 6));
  const fertileEnd = addDays(lmp, Math.max(length - 12, 10));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Cycle">
          <div className="space-y-4">
            <Field label="First day of last period"><TextInput type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} /></Field>
            <Field label="Usual cycle length"><AffixInput suffix="days" value={cycle} onChange={(e) => setCycle(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Estimated ovulation" value={ovulation ?? "—"}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Fertile from" value={fertileStart ?? "—"} />
            <Stat label="Fertile until" value={fertileEnd ?? "—"} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function TdeeCalculator({ tool }: { tool: Tool }) {
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState("1.55");
  const w = parseNumber(weight);
  const h = parseNumber(height);
  const years = parseNumber(age);
  const factor = parseNumber(activity) ?? 1.2;
  const bmr = w && h && years ? (sex === "male" ? 10 * w + 6.25 * h - 5 * years + 5 : 10 * w + 6.25 * h - 5 * years - 161) : null;
  const tdee = bmr != null ? bmr * factor : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="You">
          <div className="space-y-4">
            <Field label="Sex">
              <SelectInput value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </SelectInput>
            </Field>
            <Field label="Age"><TextInput value={age} onChange={(e) => setAge(e.target.value)} /></Field>
            <Field label="Weight"><AffixInput suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
            <Field label="Height"><AffixInput suffix="cm" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>
            <Field label="Activity">
              <SelectInput value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="1.2">Desk job, little exercise</option>
                <option value="1.375">Light exercise</option>
                <option value="1.55">3–5 workouts a week</option>
                <option value="1.725">Hard training</option>
                <option value="1.9">Physical job or two-a-days</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Maintenance" value={tdee == null ? "—" : formatNumber(tdee, 0)} subtitle="kcal / day">
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="BMR" value={bmr == null ? "—" : formatNumber(bmr, 0)} />
            <Stat label="Cut (~0.5 kg/week)" value={tdee == null ? "—" : formatNumber(tdee - 500, 0)} />
            <Stat label="Slow bulk" value={tdee == null ? "—" : formatNumber(tdee + 250, 0)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function ProteinCalculator({ tool }: { tool: Tool }) {
  const [weight, setWeight] = useState("70");
  const [goal, setGoal] = useState("1.6");
  const w = parseNumber(weight);
  const grams = parseNumber(goal);
  const daily = w && grams ? w * grams : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Intake">
          <div className="space-y-4">
            <Field label="Body weight"><AffixInput suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
            <Field label="Target">
              <SelectInput value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="0.8">Sedentary (0.8 g/kg)</option>
                <option value="1.2">Active (1.2 g/kg)</option>
                <option value="1.6">Strength training (1.6 g/kg)</option>
                <option value="2.2">High volume (2.2 g/kg)</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Protein per day" value={daily == null ? "—" : `${formatNumber(daily, 0)} g`} />
      </div>
    </ToolPageLayout>
  );
}

export function WaterIntakeCalculator({ tool }: { tool: Tool }) {
  const [weight, setWeight] = useState("70");
  const [active, setActive] = useState("no");
  const w = parseNumber(weight);
  const liters = w ? (w * 0.033 + (active === "yes" ? 0.5 : 0)) : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="You">
          <div className="space-y-4">
            <Field label="Weight"><AffixInput suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
            <Field label="Workout today">
              <SelectInput value={active} onChange={(e) => setActive(e.target.value)}>
                <option value="no">No</option>
                <option value="yes">Yes, add about 500 ml</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Aim for" value={liters == null ? "—" : `${formatNumber(liters, 1)} L`} subtitle="a starting point, not a prescription" />
      </div>
    </ToolPageLayout>
  );
}

export function IdealWeightCalculator({ tool }: { tool: Tool }) {
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState("175");
  const cm = parseNumber(height);
  const inches = cm ? cm / 2.54 : null;
  const extra = inches != null ? inches - 60 : null;
  const devine = extra != null ? (sex === "male" ? 50 + 2.3 * extra : 45.5 + 2.3 * extra) : null;
  const robinson = extra != null ? (sex === "male" ? 52 + 1.9 * extra : 49 + 1.7 * extra) : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Height">
          <div className="space-y-4">
            <Field label="Sex">
              <SelectInput value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </SelectInput>
            </Field>
            <Field label="Height"><AffixInput suffix="cm" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Devine estimate" value={devine == null ? "—" : `${formatNumber(devine, 1)} kg`}>
          <div className="mt-6">
            <Stat label="Robinson" value={robinson == null ? "—" : `${formatNumber(robinson, 1)} kg`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function CompoundInterestCalculator({ tool }: { tool: Tool }) {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [n, setN] = useState("12");
  const p = parseNumber(principal);
  const r = parseNumber(rate);
  const t = parseNumber(years);
  const compounds = parseNumber(n) ?? 1;
  const final = p != null && r != null && t != null ? p * Math.pow(1 + r / 100 / compounds, compounds * t) : null;
  const rows = [];
  if (p != null && r != null && t != null) {
    for (let year = 1; year <= Math.min(t, 20); year += 1) {
      rows.push({ year, value: p * Math.pow(1 + r / 100 / compounds, compounds * year) });
    }
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Deposit">
          <div className="space-y-4">
            <Field label="Starting amount"><AffixInput suffix="$" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></Field>
            <Field label="Annual rate"><AffixInput suffix="%" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Years"><TextInput value={years} onChange={(e) => setYears(e.target.value)} /></Field>
            <Field label="Compounds per year"><TextInput value={n} onChange={(e) => setN(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Balance" value={money(final)}>
          <p className="mt-4 text-sm text-muted">Interest earned: {money(final != null && p != null ? final - p : null)}</p>
          <ul className="mt-4 max-h-56 space-y-1 overflow-auto text-sm text-muted">
            {rows.map((row) => (
              <li key={row.year}>Year {row.year}: {money(row.value)}</li>
            ))}
          </ul>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function OvertimeCalculator({ tool }: { tool: Tool }) {
  const [rate, setRate] = useState("18");
  const [regular, setRegular] = useState("40");
  const [over, setOver] = useState("6");
  const [mult, setMult] = useState("1.5");
  const hourly = parseNumber(rate);
  const hours = parseNumber(regular);
  const extra = parseNumber(over);
  const factor = parseNumber(mult);
  const regularPay = hourly != null && hours != null ? hourly * hours : null;
  const otPay = hourly != null && extra != null && factor != null ? hourly * factor * extra : null;
  const total = regularPay != null && otPay != null ? regularPay + otPay : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Hours">
          <div className="space-y-4">
            <Field label="Hourly rate"><AffixInput suffix="$" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Regular hours"><TextInput value={regular} onChange={(e) => setRegular(e.target.value)} /></Field>
            <Field label="Overtime hours"><TextInput value={over} onChange={(e) => setOver(e.target.value)} /></Field>
            <Field label="Overtime multiplier"><TextInput value={mult} onChange={(e) => setMult(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="This week" value={money(total)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Regular" value={money(regularPay)} />
            <Stat label="Overtime" value={money(otPay)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

function parseClock(value: string) {
  const parts = value.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PaceCalculator({ tool }: { tool: Tool }) {
  const [distance, setDistance] = useState("5");
  const [time, setTime] = useState("25:00");
  const km = parseNumber(distance);
  const seconds = parseClock(time);
  const paceSec = km && seconds ? seconds / km : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Run">
          <div className="space-y-4">
            <Field label="Distance"><AffixInput suffix="km" value={distance} onChange={(e) => setDistance(e.target.value)} /></Field>
            <Field label="Finish time"><TextInput value={time} placeholder="mm:ss or hh:mm:ss" onChange={(e) => setTime(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Pace" value={paceSec == null ? "—" : `${formatClock(paceSec)} / km`}>
          <p className="mt-4 text-sm text-muted">
            {paceSec == null ? "Use 25:00 for 25 minutes." : `${formatClock(paceSec * 1.609344)} / mile`}
          </p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function SipCalculator({ tool }: { tool: Tool }) {
  const [monthly, setMonthly] = useState("200");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const pmt = parseNumber(monthly);
  const annual = parseNumber(rate);
  const t = parseNumber(years);
  const n = t != null ? t * 12 : null;
  const i = annual != null ? annual / 100 / 12 : null;
  const future = pmt != null && i != null && n != null && i !== 0 ? pmt * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : pmt != null && n != null ? pmt * n : null;
  const invested = pmt != null && n != null ? pmt * n : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Plan">
          <div className="space-y-4">
            <Field label="Monthly amount"><AffixInput suffix="$" value={monthly} onChange={(e) => setMonthly(e.target.value)} /></Field>
            <Field label="Expected yearly return"><AffixInput suffix="%" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Years"><TextInput value={years} onChange={(e) => setYears(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Estimated value" value={money(future)}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="You put in" value={money(invested)} />
            <Stat label="Gain" value={money(future != null && invested != null ? future - invested : null)} />
          </div>
          <p className="mt-4 text-xs text-subtle">Markets do not return a fixed percent. This is a worksheet, not advice.</p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function CgpaToPercentage({ tool }: { tool: Tool }) {
  const [cgpa, setCgpa] = useState("8.2");
  const [scale, setScale] = useState("9.5");
  const value = parseNumber(cgpa);
  const factor = parseNumber(scale);
  const percent = value != null && factor != null ? value * factor : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="CGPA">
          <div className="space-y-4">
            <Field label="CGPA"><TextInput value={cgpa} onChange={(e) => setCgpa(e.target.value)} /></Field>
            <Field label="Your university uses">
              <SelectInput value={scale} onChange={(e) => setScale(e.target.value)}>
                <option value="9.5">CGPA × 9.5 (common in India)</option>
                <option value="10">CGPA × 10</option>
                <option value="9">CGPA × 9</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Percentage" value={percent == null ? "—" : `${formatNumber(percent, 1)}%`} />
      </div>
    </ToolPageLayout>
  );
}

export function PercentageToGpa({ tool }: { tool: Tool }) {
  const [percent, setPercent] = useState("85");
  const [scale, setScale] = useState("4");
  const marks = parseNumber(percent);
  const top = parseNumber(scale);
  const gpa = marks != null && top != null ? (marks / 100) * top : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Marks">
          <div className="space-y-4">
            <Field label="Percentage"><AffixInput suffix="%" value={percent} onChange={(e) => setPercent(e.target.value)} /></Field>
            <Field label="GPA scale">
              <SelectInput value={scale} onChange={(e) => setScale(e.target.value)}>
                <option value="4">4.0</option>
                <option value="5">5.0</option>
                <option value="10">10.0</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard title="Estimated GPA" value={gpa == null ? "—" : formatNumber(gpa, 2)} />
      </div>
    </ToolPageLayout>
  );
}
