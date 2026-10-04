import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Limits of Toolora calculators, converters, writing helpers and health or finance estimates.",
};

export default function DisclaimerPage() {
  return (
    <Article title="Disclaimer" updated="3 October 2026">
      <p>
        Toolora publishes free utilities and short explainers. Nothing on this website is professional
        advice tailored to you.
      </p>
      <h2>Health and fitness</h2>
      <p>
        BMI, calorie and similar numbers are screening estimates. They do not diagnose a condition and they
        do not replace a doctor, dietitian or other clinician.
      </p>
      <h2>Money and work</h2>
      <p>
        Loan, interest, salary and tip results are illustrations. Lenders, employers and tax rules differ.
        Check figures with an accountant or the institution involved before you commit money.
      </p>
      <h2>Study and grades</h2>
      <p>
        GPA, attendance and exam tools follow common formulas. Your school may use another scale. The
        official record is whatever your institution publishes.
      </p>
      <h2>Writing tools</h2>
      <p>
        Rewriters and grammar helpers are for drafts you created. Using them to disguise copied text is
        still plagiarism. You are responsible for citations and for what you submit.
      </p>
      <h2>Files and conversions</h2>
      <p>
        Image, document and video conversions can drop layout, fonts or metadata. Keep the original file.
        Document tools that extract text are not a substitute for a print-ready office suite.
      </p>
      <h2>Developer utilities</h2>
      <p>
        Hash, JWT and encoding tools are for inspection and learning. A JWT decoder does not prove a token
        is genuine. Do not paste production secrets into a public computer.
      </p>
      <p>
        Privacy practices are in the{" "}
        <Link href="/privacy-policy" className="font-semibold text-brand">
          Privacy Policy
        </Link>
        .
      </p>
    </Article>
  );
}
