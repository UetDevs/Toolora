import { MonitorSmartphone, ShieldCheck, UserRoundX, Zap } from "lucide-react";

const items = [
  { icon: Zap, label: "Runs in this tab" },
  { icon: ShieldCheck, label: "Free" },
  { icon: MonitorSmartphone, label: "Phone or desktop" },
  { icon: UserRoundX, label: "No signup" },
];

export function TrustBadges() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <item.icon className="h-4 w-4 text-brand" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
