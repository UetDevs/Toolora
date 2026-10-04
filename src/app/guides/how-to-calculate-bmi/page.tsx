import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "How to calculate BMI",
  description: "Learn the Body Mass Index formula, the standard adult ranges, and how to use the Toolora BMI calculator.",
};

export default function BmiGuidePage() {
  return (
    <Article title="How to calculate BMI">
      <p>
        Body Mass Index is weight in kilograms divided by height in meters squared. For 70 kg and 175 cm,
        that is 70 ÷ 1.75² = 22.9, which sits in the usual adult “normal” band.
      </p>
      <h2>Adult ranges</h2>
      <ul>
        <li>Underweight: below 18.5</li>
        <li>Normal: 18.5 to 24.9</li>
        <li>Overweight: 25 to 29.9</li>
        <li>Obese: 30 and above</li>
      </ul>
      <h2>What BMI misses</h2>
      <p>
        BMI does not measure fat directly. Athletes, older adults and children often need another
        assessment. Treat the number as a screening hint, then speak with a clinician about your own
        health.
      </p>
      <p>
        Use the{" "}
        <Link href="/tools/calculators/bmi-calculator" className="font-semibold text-brand">
          BMI Calculator
        </Link>{" "}
        for a fast check.
      </p>
    </Article>
  );
}
