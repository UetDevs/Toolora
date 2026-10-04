"use client";

import { useMemo, useState } from "react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { formatNumber, parseNumber } from "@/lib/utils";
import { AffixInput, Field, Panel, ResultCard, SelectInput, TextInput } from "./fields";

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export function AgeCalculator({ tool }: { tool: Tool }) {
  const [birth, setBirth] = useState("2000-01-01");
  const [target, setTarget] = useState(() => new Date().toISOString().slice(0, 10));

  const result = useMemo(() => {
    const start = new Date(birth);
    const end = new Date(target);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const prev = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prev;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    const next = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (next < end) next.setFullYear(next.getFullYear() + 1);
    const nextDays = Math.ceil((next.getTime() - end.getTime()) / 86400000);
    return { years, months, days, totalDays, nextDays };
  }, [birth, target]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Enter Dates">
          <div className="space-y-4">
            <Field label="Date of birth"><TextInput type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
            <Field label="Age at date"><TextInput type="date" value={target} onChange={(e) => setTarget(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Your Age" value={result ? `${result.years}` : "—"} subtitle={result ? "years old" : undefined}>
          {result ? (
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Stat label="Months" value={String(result.months)} />
              <Stat label="Days" value={String(result.days)} />
              <Stat label="Total days" value={formatNumber(result.totalDays, 0)} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Choose a birth date on or before the target date.</p>
          )}
          {result ? <p className="mt-4 text-sm text-muted">Next birthday is in {result.nextDays} days.</p> : null}
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function PercentageCalculator({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState("of");
  const [a, setA] = useState("25");
  const [b, setB] = useState("200");
  const first = parseNumber(a);
  const second = parseNumber(b);
  let value: number | null = null;
  if (first != null && second != null && second !== 0) {
    if (mode === "of") value = (first / 100) * second;
    if (mode === "is") value = (first / second) * 100;
    if (mode === "change") value = ((second - first) / first) * 100;
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Percentage Inputs">
          <div className="space-y-4">
            <Field label="Calculate">
              <SelectInput value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="of">What is X% of Y</option>
                <option value="is">X is what % of Y</option>
                <option value="change">Percent change from X to Y</option>
              </SelectInput>
            </Field>
            <Field label={mode === "of" ? "Percent (X)" : "First value (X)"}>
              <TextInput value={a} onChange={(e) => setA(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label={mode === "of" ? "Value (Y)" : "Second value (Y)"}>
              <TextInput value={b} onChange={(e) => setB(e.target.value)} inputMode="decimal" />
            </Field>
          </div>
        </Panel>
        <ResultCard
          title="Result"
          value={value == null ? "—" : formatNumber(value)}
          subtitle={mode === "of" ? "calculated value" : "percent"}
        />
      </div>
    </ToolPageLayout>
  );
}

export function DiscountCalculator({ tool }: { tool: Tool }) {
  const [price, setPrice] = useState("120");
  const [discount, setDiscount] = useState("20");
  const original = parseNumber(price);
  const off = parseNumber(discount);
  const saved = original != null && off != null ? (original * off) / 100 : null;
  const final = original != null && saved != null ? original - saved : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Price Details">
          <div className="space-y-4">
            <Field label="Original price"><AffixInput suffix="$" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Discount"><AffixInput suffix="%" value={discount} onChange={(e) => setDiscount(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Final Price" value={final == null ? "—" : `$${formatNumber(final)}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="You save" value={saved == null ? "—" : `$${formatNumber(saved)}`} />
            <Stat label="Discount" value={`${discount || "0"}%`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function TipCalculator({ tool }: { tool: Tool }) {
  const [bill, setBill] = useState("86");
  const [tip, setTip] = useState("15");
  const [people, setPeople] = useState("2");
  const billValue = parseNumber(bill);
  const tipValue = parseNumber(tip);
  const count = parseNumber(people);
  const tipAmount = billValue != null && tipValue != null ? (billValue * tipValue) / 100 : null;
  const total = billValue != null && tipAmount != null ? billValue + tipAmount : null;
  const each = total != null && count && count > 0 ? total / count : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Bill Details">
          <div className="space-y-4">
            <Field label="Bill amount"><AffixInput suffix="$" value={bill} onChange={(e) => setBill(e.target.value)} /></Field>
            <Field label="Tip percent"><AffixInput suffix="%" value={tip} onChange={(e) => setTip(e.target.value)} /></Field>
            <Field label="People"><TextInput value={people} onChange={(e) => setPeople(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Total" value={total == null ? "—" : `$${formatNumber(total)}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Tip" value={tipAmount == null ? "—" : `$${formatNumber(tipAmount)}`} />
            <Stat label="Per person" value={each == null ? "—" : `$${formatNumber(each)}`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function LoanCalculator({ tool }: { tool: Tool }) {
  const [amount, setAmount] = useState("25000");
  const [rate, setRate] = useState("7.5");
  const [years, setYears] = useState("5");
  const principal = parseNumber(amount);
  const annual = parseNumber(rate);
  const term = parseNumber(years);
  let payment: number | null = null;
  let total: number | null = null;
  let interest: number | null = null;
  if (principal && annual != null && term && term > 0) {
    const monthlyRate = annual / 100 / 12;
    const n = term * 12;
    payment = monthlyRate === 0 ? principal / n : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    total = payment * n;
    interest = total - principal;
  }

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Loan Details">
          <div className="space-y-4">
            <Field label="Loan amount"><AffixInput suffix="$" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Annual interest"><AffixInput suffix="%" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Term"><AffixInput suffix="years" value={years} onChange={(e) => setYears(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Monthly Payment" value={payment == null ? "—" : `$${formatNumber(payment)}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Total paid" value={total == null ? "—" : `$${formatNumber(total)}`} />
            <Stat label="Total interest" value={interest == null ? "—" : `$${formatNumber(interest)}`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function InterestCalculator({ tool }: { tool: Tool }) {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("3");
  const [n, setN] = useState("12");
  const p = parseNumber(principal);
  const r = parseNumber(rate);
  const t = parseNumber(years);
  const compounds = parseNumber(n) ?? 1;
  const simple = p != null && r != null && t != null ? p * (r / 100) * t : null;
  const compound =
    p != null && r != null && t != null
      ? p * Math.pow(1 + r / 100 / compounds, compounds * t) - p
      : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Investment Details">
          <div className="space-y-4">
            <Field label="Principal"><AffixInput suffix="$" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></Field>
            <Field label="Annual rate"><AffixInput suffix="%" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Years"><TextInput value={years} onChange={(e) => setYears(e.target.value)} /></Field>
            <Field label="Compounds per year"><TextInput value={n} onChange={(e) => setN(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Compound Interest" value={compound == null ? "—" : `$${formatNumber(compound)}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Simple interest" value={simple == null ? "—" : `$${formatNumber(simple)}`} />
            <Stat label="Final amount" value={p != null && compound != null ? `$${formatNumber(p + compound)}` : "—"} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function SalaryCalculator({ tool }: { tool: Tool }) {
  const [amount, setAmount] = useState("28");
  const [period, setPeriod] = useState("hour");
  const [hours, setHours] = useState("40");
  const value = parseNumber(amount);
  const weeklyHours = parseNumber(hours) ?? 40;
  const yearly =
    value == null
      ? null
      : period === "year"
        ? value
        : period === "month"
          ? value * 12
          : period === "week"
            ? value * 52
            : value * weeklyHours * 52;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pay Details">
          <div className="space-y-4">
            <Field label="Amount"><AffixInput suffix="$" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Paid">
              <SelectInput value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="hour">Hourly</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </SelectInput>
            </Field>
            <Field label="Hours per week"><TextInput value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard title="Yearly Salary" value={yearly == null ? "—" : `$${formatNumber(yearly, 0)}`}>
          {yearly != null ? (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Monthly" value={`$${formatNumber(yearly / 12)}`} />
              <Stat label="Weekly" value={`$${formatNumber(yearly / 52)}`} />
              <Stat label="Hourly" value={`$${formatNumber(yearly / (weeklyHours * 52))}`} />
            </div>
          ) : null}
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function DateCalculator({ tool }: { tool: Tool }) {
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-10-03");
  const [days, setDays] = useState("30");
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff =
    Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
      ? null
      : Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
  const offset = parseNumber(days) ?? 0;
  const added = Number.isNaN(startDate.getTime())
    ? null
    : new Date(startDate.getTime() + offset * 86400000).toISOString().slice(0, 10);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Dates">
          <div className="space-y-4">
            <Field label="Start date"><TextInput type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="End date"><TextInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
            <Field label="Add or subtract days from start">
              <TextInput value={days} onChange={(e) => setDays(e.target.value)} />
            </Field>
          </div>
        </Panel>
        <ResultCard title="Days Between" value={diff == null ? "—" : formatNumber(Math.abs(diff), 0)}>
          <p className="mt-4 text-sm text-muted">
            Start date plus {offset} days is <span className="font-semibold text-ink">{added ?? "—"}</span>.
          </p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function TimeCalculator({ tool }: { tool: Tool }) {
  const [h1, setH1] = useState("2");
  const [m1, setM1] = useState("15");
  const [s1, setS1] = useState("0");
  const [h2, setH2] = useState("1");
  const [m2, setM2] = useState("45");
  const [s2, setS2] = useState("30");
  const [op, setOp] = useState("add");
  const t1 = (parseNumber(h1) ?? 0) * 3600 + (parseNumber(m1) ?? 0) * 60 + (parseNumber(s1) ?? 0);
  const t2 = (parseNumber(h2) ?? 0) * 3600 + (parseNumber(m2) ?? 0) * 60 + (parseNumber(s2) ?? 0);
  const total = Math.max(0, op === "add" ? t1 + t2 : t1 - t2);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Time Values">
          <div className="space-y-4">
            <TimeRow label="First time" h={h1} m={m1} s={s1} setH={setH1} setM={setM1} setS={setS1} />
            <Field label="Operation">
              <SelectInput value={op} onChange={(e) => setOp(e.target.value)}>
                <option value="add">Add</option>
                <option value="sub">Subtract</option>
              </SelectInput>
            </Field>
            <TimeRow label="Second time" h={h2} m={m2} s={s2} setH={setH2} setM={setM2} setS={setS2} />
          </div>
        </Panel>
        <ResultCard title="Result" value={`${hours}h ${minutes}m ${seconds}s`} />
      </div>
    </ToolPageLayout>
  );
}

export function AverageCalculator({ tool }: { tool: Tool }) {
  const [text, setText] = useState("10, 20, 30, 40");
  const numbers = text.split(/[\s,]+/).map(parseNumber).filter((n): n is number => n != null);
  const avg = numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Numbers">
          <Field label="Enter numbers separated by commas">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-36 w-full rounded-lg border border-line px-3.5 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </Field>
        </Panel>
        <ResultCard title="Average" value={avg == null ? "—" : formatNumber(avg)}>
          <p className="mt-4 text-sm text-muted">{numbers.length} numbers entered.</p>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function RatioCalculator({ tool }: { tool: Tool }) {
  const [a, setA] = useState("8");
  const [b, setB] = useState("12");
  const left = parseNumber(a);
  const right = parseNumber(b);
  const divisor = left && right ? gcd(left, right) : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ratio Values">
          <div className="grid grid-cols-2 gap-3">
            <Field label="A"><TextInput value={a} onChange={(e) => setA(e.target.value)} /></Field>
            <Field label="B"><TextInput value={b} onChange={(e) => setB(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard
          title="Simplified Ratio"
          value={left && right && divisor ? `${left / divisor} : ${right / divisor}` : "—"}
        />
      </div>
    </ToolPageLayout>
  );
}

export function FractionCalculator({ tool }: { tool: Tool }) {
  const [n1, setN1] = useState("1");
  const [d1, setD1] = useState("2");
  const [n2, setN2] = useState("1");
  const [d2, setD2] = useState("3");
  const [op, setOp] = useState("add");
  const a = parseNumber(n1);
  const b = parseNumber(d1);
  const c = parseNumber(n2);
  const d = parseNumber(d2);
  let num: number | null = null;
  let den: number | null = null;
  if (a != null && b && c != null && d) {
    if (op === "add") {
      num = a * d + c * b;
      den = b * d;
    } else if (op === "sub") {
      num = a * d - c * b;
      den = b * d;
    } else if (op === "mul") {
      num = a * c;
      den = b * d;
    } else if (d !== 0) {
      num = a * d;
      den = b * c;
    }
  }
  const factor = num != null && den ? gcd(num, den) : null;
  const simpleN = num != null && factor ? num / factor : null;
  const simpleD = den != null && factor ? den / factor : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Fractions">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Numerator 1"><TextInput value={n1} onChange={(e) => setN1(e.target.value)} /></Field>
              <Field label="Denominator 1"><TextInput value={d1} onChange={(e) => setD1(e.target.value)} /></Field>
            </div>
            <Field label="Operation">
              <SelectInput value={op} onChange={(e) => setOp(e.target.value)}>
                <option value="add">Add</option>
                <option value="sub">Subtract</option>
                <option value="mul">Multiply</option>
                <option value="div">Divide</option>
              </SelectInput>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Numerator 2"><TextInput value={n2} onChange={(e) => setN2(e.target.value)} /></Field>
              <Field label="Denominator 2"><TextInput value={d2} onChange={(e) => setD2(e.target.value)} /></Field>
            </div>
          </div>
        </Panel>
        <ResultCard title="Result" value={simpleN != null && simpleD ? `${simpleN}/${simpleD}` : "—"}>
          {simpleN != null && simpleD ? (
            <p className="mt-4 text-sm text-muted">Decimal: {formatNumber(simpleN / simpleD)}</p>
          ) : null}
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function CalorieCalculator({ tool }: { tool: Tool }) {
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("28");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState("1.55");
  const w = parseNumber(weight);
  const h = parseNumber(height);
  const years = parseNumber(age);
  const factor = parseNumber(activity) ?? 1.2;
  const bmr =
    w && h && years
      ? sex === "male"
        ? 10 * w + 6.25 * h - 5 * years + 5
        : 10 * w + 6.25 * h - 5 * years - 161
      : null;
  const tdee = bmr != null ? bmr * factor : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your Details">
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
                <option value="1.2">Sedentary</option>
                <option value="1.375">Lightly active</option>
                <option value="1.55">Moderately active</option>
                <option value="1.725">Very active</option>
                <option value="1.9">Extra active</option>
              </SelectInput>
            </Field>
            <p className="text-xs text-subtle">Estimate uses the Mifflin-St Jeor formula.</p>
          </div>
        </Panel>
        <ResultCard title="Daily Calories" value={tdee == null ? "—" : formatNumber(tdee, 0)} subtitle="estimated TDEE">
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="BMR" value={bmr == null ? "—" : formatNumber(bmr, 0)} />
            <Stat label="To lose ~0.5kg/week" value={tdee == null ? "—" : formatNumber(tdee - 500, 0)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

function TimeRow({
  label,
  h,
  m,
  s,
  setH,
  setM,
  setS,
}: {
  label: string;
  h: string;
  m: string;
  s: string;
  setH: (v: string) => void;
  setM: (v: string) => void;
  setS: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <AffixInput suffix="h" value={h} onChange={(e) => setH(e.target.value)} />
        <AffixInput suffix="m" value={m} onChange={(e) => setM(e.target.value)} />
        <AffixInput suffix="s" value={s} onChange={(e) => setS(e.target.value)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
