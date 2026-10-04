import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";

export const metadata: Metadata = {
  title: "Keep files private in browser tools",
  description: "How Toolora image, document and video tools process files locally, and when a site would need a server.",
};

export default function PrivacyGuidePage() {
  return (
    <Article title="Keep files private in browser tools">
      <p>
        A lot of “free converters” ask you to upload a photo or PDF. Then a copy sits on someone else’s
        disk until they delete it. These pages try not to do that.
      </p>
      <h2>What “in the browser” means</h2>
      <p>
        Your tab can draw on a canvas, read a PDF, shrink a photo or record a short clip. Chrome, Firefox,
        Edge and Safari already have those APIs. The file stays in memory on your machine. The download
        is a new local file, not something coming back from our servers.
      </p>
      <h2>What this is good for</h2>
      <p>
        Homework screenshots, receipts, class notes, a logo, a clip you filmed. If you would not email
        that file to a stranger, use a local tool. Start with the{" "}
        <Link href="/tools/image-tools" className="font-semibold text-brand">
          image tools
        </Link>{" "}
        or{" "}
        <Link href="/tools/file-converters" className="font-semibold text-brand">
          document converters
        </Link>
        .
      </p>
      <h2>Honest limits</h2>
      <p>
        A phone browser can run out of memory on a huge video. Word-to-PDF on Toolora extracts text; it
        does not reprint every font and image. If a future tool must use a server, the page will say so
        before you attach a file.
      </p>
      <p>
        Read the{" "}
        <Link href="/privacy-policy" className="font-semibold text-brand">
          Privacy Policy
        </Link>{" "}
        for contact email and advertising cookies.
      </p>
    </Article>
  );
}
