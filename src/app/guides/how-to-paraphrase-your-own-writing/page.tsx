import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "How to paraphrase your own writing",
  description:
    "Use a paraphrasing tool as an editor for drafts you wrote. Why rewriting someone else’s work is still plagiarism.",
};

export default function ParaphraseGuidePage() {
  return (
    <Article title="How to paraphrase your own writing">
      <p>
        A paraphrasing tool is useful when you already have a draft and want a clearer, simpler or more
        formal version. Paste text you wrote, pick a style, then edit the suggestion so it still sounds
        like you.
      </p>
      <h2>What it is not for</h2>
      <p>
        Rewriting another person’s article, assignment or webpage and submitting it as yours is still
        plagiarism. Changing the words does not change the source. Cite what you used.
      </p>
      <p>
        Try the{" "}
        <Link href="/tools/writing/paraphrasing-tool" className="font-semibold text-brand">
          Paraphrasing Tool
        </Link>{" "}
        or browse all{" "}
        <Link href="/tools/writing" className="font-semibold text-brand">
          writing tools
        </Link>
        .
      </p>
    </Article>
  );
}
