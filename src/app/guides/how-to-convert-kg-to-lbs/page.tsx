import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "How to convert kilograms to pounds",
  description: "The exact kg to lbs factor, a worked example, and when to use a unit converter.",
};

export default function KgGuidePage() {
  return (
    <Article title="How to convert kilograms to pounds">
      <p>
        A kilogram is the SI unit of mass. A pound (lb) in everyday US use is the international avoirdupois
        pound. The exact factor is:
      </p>
      <p>
        <strong className="text-ink">1 kilogram = 2.2046226218 pounds</strong>
      </p>
      <h2>Worked example</h2>
      <p>
        To convert 70 kg to pounds, multiply 70 × 2.2046226218. The result is about 154.32 lb. To go the
        other way, multiply pounds by 0.45359237.
      </p>
      <h2>When precision matters</h2>
      <p>
        Shipping labels, gym logs and cooking often need only one or two decimal places. Laboratory or
        aviation work may need the full factor. Toolora’s{" "}
        <Link href="/tools/unit-converters/kg-to-lbs" className="font-semibold text-brand">
          KG → LBS
        </Link>{" "}
        and{" "}
        <Link href="/tools/unit-converters/lbs-to-kg" className="font-semibold text-brand">
          LBS → KG
        </Link>{" "}
        pages use the international pound, not a rounded 2.2 shortcut.
      </p>
      <h2>Weight is not the same as force</h2>
      <p>
        In casual speech people say “weight in kilos”. Strictly, a kilogram is mass. Bathroom scales
        estimate mass from force due to gravity. For everyday health tracking the distinction rarely
        changes the number you write down.
      </p>
    </Article>
  );
}
