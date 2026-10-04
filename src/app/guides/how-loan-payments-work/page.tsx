import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "How loan payments work",
  description: "Understand principal, interest rate and loan term, then estimate a monthly payment with Toolora.",
};

export default function LoanGuidePage() {
  return (
    <Article title="How loan payments work">
      <p>
        A standard installment loan splits repayment into equal monthly amounts. Each payment covers some
        interest and some principal. Early in the term, more of the payment is interest. Later, more of it
        reduces what you still owe.
      </p>
      <h2>The three inputs</h2>
      <p>
        Principal is the amount borrowed. The annual rate is the cost of that money. The term is how many
        months you will pay. Stretching the term lowers the monthly figure and usually raises the total
        interest.
      </p>
      <p>
        Toolora uses the common amortization formula so you can estimate EMI before you talk to a lender.
        Try the{" "}
        <Link href="/tools/calculators/loan-calculator" className="font-semibold text-brand">
          Loan Calculator
        </Link>
        . The number is an illustration, not an offer.
      </p>
    </Article>
  );
}
