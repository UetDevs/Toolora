import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "What is a Unix timestamp",
  description: "Unix epoch time in seconds, how it relates to UTC, and how to convert it on Toolora.",
};

export default function UnixGuidePage() {
  return (
    <Article title="What is a Unix timestamp">
      <p>
        A Unix timestamp is the number of seconds that have passed since 00:00:00 UTC on 1 January 1970,
        not counting leap seconds. Programmers store it because it is a single integer that any timezone
        can format later.
      </p>
      <h2>Seconds versus milliseconds</h2>
      <p>
        Many APIs use seconds (10 digits for current dates). JavaScript’s <code>Date.now()</code> uses
        milliseconds (13 digits). If a number looks about a thousand times too large, divide by 1000
        before you treat it as seconds.
      </p>
      <h2>Why it looks ugly</h2>
      <p>
        1_704_067_200 is harder to read than “1 January 2024”. Logs still prefer the integer because it
        sorts correctly and does not depend on a locale. Convert it only when a human needs to read the
        moment.
      </p>
      <p>
        Use the{" "}
        <Link href="/tools/developer-tools/unix-timestamp" className="font-semibold text-brand">
          Unix Timestamp Converter
        </Link>{" "}
        to move between epoch seconds and a readable ISO date.
      </p>
    </Article>
  );
}
