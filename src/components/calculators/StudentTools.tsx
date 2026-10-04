"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import type { Tool } from "@/lib/types";
import { formatNumber, parseNumber } from "@/lib/utils";
import { AffixInput, Field, Panel, ResultCard, SelectInput, TextInput } from "./fields";

const GRADE_POINTS: Record<string, number> = {
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  D: 1,
  F: 0,
};

function letterFromPercent(score: number) {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function AddRowButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

export function GpaCalculator({ tool }: { tool: Tool }) {
  const [rows, setRows] = useState([
    { name: "Mathematics", grade: "A", credits: "3" },
    { name: "English", grade: "B+", credits: "3" },
    { name: "Physics", grade: "A-", credits: "4" },
  ]);

  const totals = rows.reduce(
    (acc, row) => {
      const credit = parseNumber(row.credits) ?? 0;
      acc.points += (GRADE_POINTS[row.grade] ?? 0) * credit;
      acc.credits += credit;
      return acc;
    },
    { points: 0, credits: 0 },
  );
  const gpa = totals.credits ? totals.points / totals.credits : null;
  const letter = gpa == null ? "—" : letterFromPercent(gpa * 25);

  return (
    <ToolPageLayout
      tool={tool}
      extra={<GradeScale />}
      example={
        <ol className="mt-4 space-y-2 text-sm text-muted">
          <li>1. Add each course, letter grade and credit hours.</li>
          <li>2. GPA is the credit-weighted average of grade points.</li>
        </ol>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Semester Courses" action={<AddRowButton onClick={() => setRows([...rows, { name: "", grade: "B", credits: "3" }])}>Add course</AddRowButton>}>
          <div className="mb-2 hidden grid-cols-[1.3fr_0.7fr_0.6fr_36px] gap-2 text-xs font-medium text-subtle sm:grid">
            <span>Course</span>
            <span>Grade</span>
            <span>Credits</span>
            <span />
          </div>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_70px_36px] gap-2 sm:grid-cols-[1.3fr_0.7fr_0.6fr_36px]">
                <TextInput
                  placeholder="Course"
                  value={row.name}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, name: e.target.value };
                    setRows(next);
                  }}
                />
                <SelectInput
                  value={row.grade}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, grade: e.target.value };
                    setRows(next);
                  }}
                >
                  {Object.keys(GRADE_POINTS).map((grade) => (
                    <option key={grade}>{grade}</option>
                  ))}
                </SelectInput>
                <TextInput
                  inputMode="decimal"
                  value={row.credits}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, credits: e.target.value };
                    setRows(next);
                  }}
                />
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center text-subtle hover:text-rose-500"
                  onClick={() => setRows(rows.filter((_, i) => i !== index))}
                  aria-label="Remove course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <ResultCard title="Semester GPA" value={gpa == null ? "—" : formatNumber(gpa, 2)} subtitle={`Letter equivalent ${letter}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Credits" value={formatNumber(totals.credits, 1)} />
            <Stat label="Quality points" value={formatNumber(totals.points, 2)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function CgpaCalculator({ tool }: { tool: Tool }) {
  const [rows, setRows] = useState([
    { name: "Semester 1", gpa: "3.60", credits: "18" },
    { name: "Semester 2", gpa: "3.80", credits: "20" },
  ]);

  const totals = rows.reduce(
    (acc, row) => {
      const gpa = parseNumber(row.gpa);
      const credits = parseNumber(row.credits) ?? 0;
      if (gpa != null) acc.points += gpa * credits;
      acc.credits += credits;
      return acc;
    },
    { points: 0, credits: 0 },
  );
  const cgpa = totals.credits ? totals.points / totals.credits : null;

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          CGPA = sum of (semester GPA × credits) ÷ total credits. Example: (3.6×18 + 3.8×20) ÷ 38 = 3.71.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Semester Results" action={<AddRowButton onClick={() => setRows([...rows, { name: `Semester ${rows.length + 1}`, gpa: "3.50", credits: "18" }])}>Add semester</AddRowButton>}>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_80px_36px] gap-2">
                <TextInput
                  value={row.name}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, name: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  value={row.gpa}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, gpa: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  value={row.credits}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, credits: e.target.value };
                    setRows(next);
                  }}
                />
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center text-subtle hover:text-rose-500"
                  onClick={() => setRows(rows.filter((_, i) => i !== index))}
                  aria-label="Remove semester"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <ResultCard title="CGPA" value={cgpa == null ? "—" : formatNumber(cgpa, 2)} subtitle={`${formatNumber(totals.credits, 0)} total credits`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Semesters" value={String(rows.length)} />
            <Stat label="Credit points" value={formatNumber(totals.points, 2)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function AttendanceCalculator({ tool }: { tool: Tool }) {
  const [held, setHeld] = useState("40");
  const [attended, setAttended] = useState("32");
  const [required, setRequired] = useState("75");
  const [upcoming, setUpcoming] = useState("10");

  const total = parseNumber(held);
  const present = parseNumber(attended);
  const need = parseNumber(required);
  const extra = parseNumber(upcoming) ?? 0;

  const current = total && present != null && total > 0 ? (present / total) * 100 : null;
  const requiredClasses = total && need != null ? Math.ceil((need / 100) * total) : null;
  const canMiss =
    total && present != null && need != null
      ? Math.max(0, present - Math.ceil((need / 100) * total))
      : null;
  const mustAttend =
    total && present != null && need != null && extra > 0
      ? Math.max(0, Math.ceil((need / 100) * (total + extra) - present))
      : null;
  const futurePercent =
    total && present != null && extra > 0 && mustAttend != null
      ? ((present + Math.min(mustAttend, extra)) / (total + extra)) * 100
      : null;

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          If 40 classes were held and you attended 32, your attendance is 80%. At a 75% rule you can still miss some classes, or see how many of the next 10 you must attend.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Attendance Details">
          <div className="space-y-4">
            <Field label="Classes held"><TextInput inputMode="numeric" value={held} onChange={(e) => setHeld(e.target.value)} /></Field>
            <Field label="Classes attended"><TextInput inputMode="numeric" value={attended} onChange={(e) => setAttended(e.target.value)} /></Field>
            <Field label="Required attendance"><AffixInput suffix="%" value={required} onChange={(e) => setRequired(e.target.value)} /></Field>
            <Field label="Upcoming classes"><TextInput inputMode="numeric" value={upcoming} onChange={(e) => setUpcoming(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard
          title="Current Attendance"
          value={current == null ? "—" : `${formatNumber(current, 1)}%`}
          subtitle={current != null && need != null ? (current >= need ? "You are above the required mark" : "You are below the required mark") : undefined}
        >
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Required classes so far" value={requiredClasses == null ? "—" : String(requiredClasses)} />
            <Stat label="Classes you can miss" value={canMiss == null ? "—" : String(canMiss)} />
            <Stat label="Must attend next" value={mustAttend == null ? "—" : String(mustAttend)} />
            <Stat label="If you do that" value={futurePercent == null ? "—" : `${formatNumber(futurePercent, 1)}%`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function GradeCalculator({ tool }: { tool: Tool }) {
  const [rows, setRows] = useState([
    { name: "Quiz 1", score: "18", total: "20" },
    { name: "Assignment", score: "42", total: "50" },
    { name: "Midterm", score: "68", total: "80" },
  ]);

  const totals = rows.reduce(
    (acc, row) => {
      const score = parseNumber(row.score);
      const total = parseNumber(row.total);
      if (score != null) acc.score += score;
      if (total != null) acc.total += total;
      return acc;
    },
    { score: 0, total: 0 },
  );
  const percent = totals.total ? (totals.score / totals.total) * 100 : null;
  const letter = percent == null ? "—" : letterFromPercent(percent);

  return (
    <ToolPageLayout tool={tool} extra={<GradeScale />}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Assessments" action={<AddRowButton onClick={() => setRows([...rows, { name: "", score: "", total: "100" }])}>Add score</AddRowButton>}>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_70px_70px_36px] gap-2">
                <TextInput
                  placeholder="Quiz, homework..."
                  value={row.name}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, name: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  placeholder="Got"
                  value={row.score}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, score: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  placeholder="Out of"
                  value={row.total}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, total: e.target.value };
                    setRows(next);
                  }}
                />
                <button type="button" className="inline-flex h-12 items-center justify-center text-subtle hover:text-rose-500" onClick={() => setRows(rows.filter((_, i) => i !== index))} aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <ResultCard title="Overall Grade" value={percent == null ? "—" : `${formatNumber(percent, 1)}%`} subtitle={`Letter grade ${letter}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Points" value={`${formatNumber(totals.score, 1)} / ${formatNumber(totals.total, 1)}`} />
            <Stat label="GPA points" value={percent == null ? "—" : formatNumber(GRADE_POINTS[letter] ?? 0, 1)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function MarksPercentageCalculator({ tool }: { tool: Tool }) {
  const [rows, setRows] = useState([
    { name: "English", obtained: "78", total: "100" },
    { name: "Math", obtained: "88", total: "100" },
    { name: "Science", obtained: "81", total: "100" },
  ]);

  const totals = rows.reduce(
    (acc, row) => {
      const obtained = parseNumber(row.obtained);
      const total = parseNumber(row.total);
      if (obtained != null) acc.obtained += obtained;
      if (total != null) acc.total += total;
      return acc;
    },
    { obtained: 0, total: 0 },
  );
  const percent = totals.total ? (totals.obtained / totals.total) * 100 : null;

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          Percentage = (obtained marks ÷ total marks) × 100. Add every subject for an overall result.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Subject Marks" action={<AddRowButton onClick={() => setRows([...rows, { name: "", obtained: "", total: "100" }])}>Add subject</AddRowButton>}>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_80px_36px] gap-2">
                <TextInput
                  placeholder="Subject"
                  value={row.name}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, name: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  placeholder="Got"
                  value={row.obtained}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, obtained: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  placeholder="Total"
                  value={row.total}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, total: e.target.value };
                    setRows(next);
                  }}
                />
                <button type="button" className="inline-flex h-12 items-center justify-center text-subtle hover:text-rose-500" onClick={() => setRows(rows.filter((_, i) => i !== index))} aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <ResultCard title="Overall Percentage" value={percent == null ? "—" : `${formatNumber(percent, 2)}%`} subtitle={percent == null ? undefined : `Grade ${letterFromPercent(percent)}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Obtained" value={formatNumber(totals.obtained, 1)} />
            <Stat label="Total" value={formatNumber(totals.total, 1)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function FinalGradeCalculator({ tool }: { tool: Tool }) {
  const [current, setCurrent] = useState("82");
  const [wanted, setWanted] = useState("90");
  const [weight, setWeight] = useState("30");
  const cur = parseNumber(current);
  const goal = parseNumber(wanted);
  const exam = parseNumber(weight);
  const needed =
    cur != null && goal != null && exam != null && exam > 0 && exam < 100
      ? (goal - cur * (1 - exam / 100)) / (exam / 100)
      : null;
  const possible = needed != null && needed <= 100;
  const already = needed != null && needed <= 0;

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          Needed final = (desired − current × (1 − exam weight)) ÷ exam weight. A 82% now with a 30% final needs 90%? You would need about 108.7% — not possible without extra credit.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Course Standing">
          <div className="space-y-4">
            <Field label="Current grade"><AffixInput suffix="%" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
            <Field label="Desired course grade"><AffixInput suffix="%" value={wanted} onChange={(e) => setWanted(e.target.value)} /></Field>
            <Field label="Final exam weight"><AffixInput suffix="%" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard
          title="Score Needed on Final"
          value={needed == null ? "—" : `${formatNumber(needed, 1)}%`}
          subtitle={
            already ? "You already have this grade" : possible ? "This target is reachable" : needed == null ? undefined : "Above 100% — not reachable without extra credit"
          }
        >
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Current worth" value={cur != null && exam != null ? `${formatNumber(cur * (1 - exam / 100), 1)}%` : "—"} />
            <Stat label="Final worth" value={exam == null ? "—" : `${exam}%`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function WeightedGradeCalculator({ tool }: { tool: Tool }) {
  const [rows, setRows] = useState([
    { name: "Homework", score: "92", weight: "20" },
    { name: "Quizzes", score: "85", weight: "20" },
    { name: "Midterm", score: "78", weight: "25" },
    { name: "Final", score: "88", weight: "35" },
  ]);

  const usedWeight = rows.reduce((sum, row) => sum + (parseNumber(row.weight) ?? 0), 0);
  const weighted = rows.reduce((sum, row) => {
    const score = parseNumber(row.score);
    const weight = parseNumber(row.weight);
    if (score == null || weight == null) return sum;
    return sum + score * (weight / 100);
  }, 0);
  const normalized = usedWeight > 0 ? (weighted / usedWeight) * 100 : null;

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          Each category score is multiplied by its weight. If weights do not add to 100, Toolora scales them so the result stays fair.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Grade Categories" action={<AddRowButton onClick={() => setRows([...rows, { name: "", score: "", weight: "10" }])}>Add category</AddRowButton>}>
          <div className="mb-2 hidden grid-cols-[1fr_80px_80px_36px] gap-2 text-xs font-medium text-subtle sm:grid">
            <span>Category</span>
            <span>Score %</span>
            <span>Weight</span>
            <span />
          </div>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_80px_36px] gap-2">
                <TextInput
                  placeholder="Homework"
                  value={row.name}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, name: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  value={row.score}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, score: e.target.value };
                    setRows(next);
                  }}
                />
                <TextInput
                  inputMode="decimal"
                  value={row.weight}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, weight: e.target.value };
                    setRows(next);
                  }}
                />
                <button type="button" className="inline-flex h-12 items-center justify-center text-subtle hover:text-rose-500" onClick={() => setRows(rows.filter((_, i) => i !== index))} aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-subtle">Weights entered: {formatNumber(usedWeight, 0)}%</p>
        </Panel>
        <ResultCard title="Weighted Grade" value={normalized == null ? "—" : `${formatNumber(normalized, 2)}%`} subtitle={`Letter ${normalized == null ? "—" : letterFromPercent(normalized)}`}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Raw weighted" value={`${formatNumber(weighted, 2)}%`} />
            <Stat label="GPA points" value={normalized == null ? "—" : formatNumber(GRADE_POINTS[letterFromPercent(normalized)] ?? 0, 1)} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function ExamCountdown({ tool }: { tool: Tool }) {
  const [name, setName] = useState("Final Exam");
  const [date, setDate] = useState("2026-12-15");
  const [time, setTime] = useState("09:00");
  const [hoursNeeded, setHoursNeeded] = useState("20");

  const result = useMemo(() => {
    const target = new Date(`${date}T${time || "00:00"}`);
    if (Number.isNaN(target.getTime())) return null;
    const ms = target.getTime() - Date.now();
    const totalHours = ms / 3600000;
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const study = parseNumber(hoursNeeded);
    const perDay = days > 0 && study != null ? study / days : study;
    return { ms, days, hours, totalHours, perDay };
  }, [date, time, hoursNeeded]);

  const passed = result != null && result.ms < 0;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Exam Details">
          <div className="space-y-4">
            <Field label="Exam name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Exam date"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Start time"><TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            <Field label="Study hours you still need"><AffixInput suffix="hrs" value={hoursNeeded} onChange={(e) => setHoursNeeded(e.target.value)} /></Field>
          </div>
        </Panel>
        <ResultCard
          title={name || "Days Remaining"}
          value={result == null ? "—" : String(Math.max(result.days, 0))}
          subtitle={passed ? "This exam date has passed" : "days to go"}
        >
          {result && !passed ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Hours left" value={formatNumber(Math.max(result.totalHours, 0), 0)} />
              <Stat label="Hours today leftover" value={String(Math.max(result.hours, 0))} />
              <Stat label="Study each remaining day" value={result.perDay == null ? "—" : `${formatNumber(result.perDay, 1)} hrs`} />
              <Stat label="Weeks left" value={formatNumber(Math.max(result.days, 0) / 7, 1)} />
            </div>
          ) : null}
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

export function StudyTimeCalculator({ tool }: { tool: Tool }) {
  const [chapters, setChapters] = useState("12");
  const [minutesEach, setMinutesEach] = useState("45");
  const [days, setDays] = useState("10");
  const [hoursDay, setHoursDay] = useState("2");
  const [session, setSession] = useState("25");

  const chapterCount = parseNumber(chapters);
  const perChapter = parseNumber(minutesEach);
  const dayCount = parseNumber(days);
  const available = parseNumber(hoursDay);
  const pomodoro = parseNumber(session) ?? 25;

  const totalMinutes = chapterCount != null && perChapter != null ? chapterCount * perChapter : null;
  const totalHours = totalMinutes != null ? totalMinutes / 60 : null;
  const neededPerDay = totalHours != null && dayCount && dayCount > 0 ? totalHours / dayCount : null;
  const availableHours = dayCount != null && available != null ? dayCount * available : null;
  const gap = totalHours != null && availableHours != null ? availableHours - totalHours : null;
  const sessions = totalMinutes != null ? Math.ceil(totalMinutes / pomodoro) : null;

  return (
    <ToolPageLayout
      tool={tool}
      example={
        <p className="mt-4 text-sm text-muted">
          12 chapters × 45 minutes = 9 hours. Across 10 days that is 0.9 hours a day. If you can study 2 hours a day you have spare time.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Study Plan">
          <div className="space-y-4">
            <Field label="Chapters or topics"><TextInput inputMode="numeric" value={chapters} onChange={(e) => setChapters(e.target.value)} /></Field>
            <Field label="Minutes per chapter"><AffixInput suffix="min" value={minutesEach} onChange={(e) => setMinutesEach(e.target.value)} /></Field>
            <Field label="Days until exam"><TextInput inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} /></Field>
            <Field label="Hours you can study each day"><AffixInput suffix="hrs" value={hoursDay} onChange={(e) => setHoursDay(e.target.value)} /></Field>
            <Field label="Focus session length">
              <SelectInput value={session} onChange={(e) => setSession(e.target.value)}>
                <option value="25">25 minute Pomodoro</option>
                <option value="50">50 minute block</option>
                <option value="90">90 minute deep work</option>
              </SelectInput>
            </Field>
          </div>
        </Panel>
        <ResultCard
          title="Hours Needed"
          value={totalHours == null ? "—" : formatNumber(totalHours, 1)}
          subtitle={gap == null ? undefined : gap >= 0 ? "Your daily plan covers the work" : "You need more study time"}
        >
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Per day" value={neededPerDay == null ? "—" : `${formatNumber(neededPerDay, 1)} hrs`} />
            <Stat label="Available total" value={availableHours == null ? "—" : `${formatNumber(availableHours, 1)} hrs`} />
            <Stat label="Sessions" value={sessions == null ? "—" : String(sessions)} />
            <Stat label="Spare / short" value={gap == null ? "—" : `${formatNumber(gap, 1)} hrs`} />
          </div>
        </ResultCard>
      </div>
    </ToolPageLayout>
  );
}

function GradeScale() {
  const rows = [
    ["A", "93–100", "4.0"],
    ["A-", "90–92", "3.7"],
    ["B+", "87–89", "3.3"],
    ["B", "83–86", "3.0"],
    ["B-", "80–82", "2.7"],
    ["C+", "77–79", "2.3"],
    ["C", "73–76", "2.0"],
    ["C-", "70–72", "1.7"],
    ["D", "60–69", "1.0"],
    ["F", "Below 60", "0.0"],
  ];

  return (
    <section className="mt-4 rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-ink">Standard 4.0 grade scale</h2>
      <div className="mt-4 divide-y divide-line text-sm">
        {rows.map(([letter, range, points]) => (
          <div key={letter} className="grid grid-cols-3 py-2.5">
            <span className="font-semibold text-ink">{letter}</span>
            <span className="text-muted">{range}</span>
            <span className="text-right text-muted">{points}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
