import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none ring-brand/15 placeholder:text-subtle focus:border-brand focus:ring-4",
        props.className,
      )}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-12 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none ring-brand/15 focus:border-brand focus:ring-4",
        props.className,
      )}
    />
  );
}

export function AffixInput({
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { suffix: string }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-line focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
      <input
        {...props}
        className="h-12 min-w-0 flex-1 bg-white px-3.5 text-sm text-ink outline-none placeholder:text-subtle"
      />
      <span className="flex items-center border-l border-line bg-slate-50 px-3 text-sm text-slate-500">
        {suffix}
      </span>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function ResetButton({
  children = "Reset",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex h-10 w-full items-center justify-center text-sm font-medium text-brand hover:underline"
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 rounded-md text-sm font-semibold",
            value === option.value ? "bg-brand text-white shadow-sm" : "text-slate-500",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ResultCard({
  title,
  value,
  subtitle,
  children,
}: {
  title: string;
  value: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="mt-2 text-5xl font-extrabold tracking-tight text-ink">{value}</p>
      {subtitle ? <p className="mt-2 text-sm font-semibold text-success">{subtitle}</p> : null}
      {children}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
